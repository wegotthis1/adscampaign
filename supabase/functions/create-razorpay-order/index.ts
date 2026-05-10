import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLANS: Record<string, { amount: number; label: string; generations: number }> = {
  starter: { amount: 49900, label: "Starter", generations: 10 },
  pro: { amount: 149900, label: "Pro", generations: 50 },
  enterprise: { amount: 499900, label: "Enterprise", generations: 999 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const { plan } = await req.json();
    if (!plan || !PLANS[plan]) return json({ error: "Invalid plan" }, 400);

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return json({ error: "Payment gateway not configured" }, 500);
    }

    const selected = PLANS[plan];
    const currency = "INR"; // Locked server-side

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: selected.amount,
        currency,
        receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { user_id: user.id, plan, user_email: user.email },
      }),
    });

    if (!razorpayResponse.ok) {
      console.error("Razorpay order creation failed:", await razorpayResponse.text());
      return json({ error: "Failed to create payment order" }, 500);
    }

    const order = await razorpayResponse.json();

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await adminClient.from("user_payments").insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      plan,
      amount: selected.amount,
      currency,
      status: "created",
    });

    return json({
      order_id: order.id,
      amount: selected.amount,
      currency,
      key_id: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
