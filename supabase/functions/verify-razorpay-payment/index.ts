import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_LIMITS: Record<string, number> = { starter: 10, pro: 50, enterprise: 999 };

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: "Missing payment details" }, 400);
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET) return json({ error: "Payment gateway not configured" }, 500);

    // Verify HMAC signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const expected = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expected !== razorpay_signature) return json({ error: "Payment verification failed" }, 400);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Look up the order
    const { data: paymentRecord } = await adminClient
      .from("user_payments")
      .select("plan, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!paymentRecord) return json({ error: "Payment record not found" }, 404);

    const plan = paymentRecord.plan;
    const limit = PLAN_LIMITS[plan] ?? 1;

    // Idempotent: if already paid, just return success without re-provisioning
    if (paymentRecord.status === "paid") {
      return json({ success: true, plan, generations_limit: limit, already_processed: true });
    }

    // Mark paid + provision plan atomically (provision_plan is idempotent)
    await adminClient
      .from("user_payments")
      .update({ razorpay_payment_id, status: "paid", updated_at: new Date().toISOString() })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id);

    await adminClient.rpc("provision_plan", {
      p_user_id: user.id,
      p_plan: plan,
      p_limit: limit,
    });

    return json({ success: true, plan, generations_limit: limit });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
