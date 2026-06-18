import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = intent.metadata?.appointment_id;

    const supabase = createAdminClient();
    const query = supabase
      .from("appointments")
      .update({ deposit_paid: true, status: "confirmed" })
      .eq("stripe_payment_intent_id", intent.id);

    const { error } = appointmentId ? await query.eq("id", appointmentId) : await query;

    if (error) {
      console.error("Failed to update appointment after payment", error);
      return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
