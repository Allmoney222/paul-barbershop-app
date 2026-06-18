"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export function DepositPayment({
  clientSecret,
  amountCents,
  onSuccess,
}: {
  clientSecret: string;
  amountCents: number;
  onSuccess: () => void;
}) {
  if (!stripePromise) {
    return (
      <p className="text-sm text-red-400">
        Stripe is not configured. Please contact the shop to pay your deposit.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night" } }}>
      <DepositForm amountCents={amountCents} onSuccess={onSuccess} />
    </Elements>
  );
}

function DepositForm({ amountCents, onSuccess }: { amountCents: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90"
      >
        {submitting ? "Processing..." : `Pay ${formatPrice(amountCents)} Deposit`}
      </Button>
    </form>
  );
}
