import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

const PLAN_LIMITS: Record<string, number> = { starter: 10, pro: 50, enterprise: 999 };

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!WEBHOOK_SECRET) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return new Response("Misconfigured", { status: 500 });
    }

    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const rawBody = await req.text();

    const valid = await verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);
    if (!valid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventId: string = event.id ?? `${event.event}_${Date.now()}`;
    const eventType: string = event.event ?? "unknown";

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Idempotency: insert event row; duplicate -> already processed
    const { error: dupErr } = await admin
      .from("razorpay_events")
      .insert({ event_id: eventId, event_type: eventType, payload: event });

    if (dupErr) {
      // Unique violation = duplicate; ack 200
      console.log("Duplicate webhook event ignored:", eventId);
      return new Response("ok", { status: 200 });
    }

    // We only care about successful captures
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const order = event.payload?.order?.entity;
      const orderId: string | undefined = payment?.order_id ?? order?.id;
      const paymentId: string | undefined = payment?.id;
      const notesUserId: string | undefined = payment?.notes?.user_id ?? order?.notes?.user_id;
      const notesPlan: string | undefined = payment?.notes?.plan ?? order?.notes?.plan;

      if (!orderId) {
        console.error("Webhook missing order id");
        return new Response("ok", { status: 200 });
      }

      // Look up payment row
      const { data: row } = await admin
        .from("user_payments")
        .select("user_id, plan, status")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

      const userId = row?.user_id ?? notesUserId;
      const plan = row?.plan ?? notesPlan;

      if (!userId || !plan) {
        console.error("Cannot resolve user/plan for webhook order", orderId);
        return new Response("ok", { status: 200 });
      }

      const limit = PLAN_LIMITS[plan] ?? 1;

      // If row missing, insert; else update to paid
      if (!row) {
        await admin.from("user_payments").insert({
          user_id: userId,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          plan,
          amount: payment?.amount ?? 0,
          currency: payment?.currency ?? "INR",
          status: "paid",
        });
      } else if (row.status !== "paid") {
        await admin
          .from("user_payments")
          .update({
            razorpay_payment_id: paymentId,
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", orderId);
      }

      await admin.rpc("provision_plan", { p_user_id: userId, p_plan: plan, p_limit: limit });
      console.log("Provisioned plan via webhook:", { userId, plan });
    } else if (eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      const orderId: string | undefined = payment?.order_id;
      if (orderId) {
        await admin
          .from("user_payments")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("razorpay_order_id", orderId);
      }
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("error", { status: 500 });
  }
});
