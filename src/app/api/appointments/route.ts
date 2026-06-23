import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { getAvailableSlots } from "@/lib/booking/availability";
import { createMockCancelToken } from "@/lib/booking/mock-booking";
import { MOCK_SERVICES, MOCK_STAFF } from "@/lib/data/mock-data";
import { getBookingSettings } from "@/lib/data/shop";
import { formatDateInTz } from "@/lib/timezone";
import { SHOP_TIMEZONE } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";
import { sendBookingConfirmationEmail } from "@/lib/email";
import type { AppointmentByTokenResult } from "@/types/database";

// Permissive UUID-format check: accepts any 8-4-4-4-12 hex string regardless
// of RFC 4122 version/variant bits (the seeded service IDs use version 0).
const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bookingSchema = z.object({
  serviceId: z.string().regex(UUID_LIKE, "Invalid service ID"),
  staffId: z.string(), // uuid or "any"
  startTime: z.string().min(1),
  clientName: z.string().min(1).max(120),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(7).max(30),
  clientNotes: z.string().max(1000).optional(),
  payDeposit: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details" }, { status: 400 });
  }

  const { serviceId, staffId, startTime, clientName, clientEmail, clientPhone, clientNotes, payDeposit } =
    parsed.data;

  const startDate = new Date(startTime);
  if (Number.isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Re-validate this slot is still open and determine eligible staff.
  const date = formatDateInTz(startDate, SHOP_TIMEZONE);
  const { slots } = await getAvailableSlots({ serviceId, staffId, date });
  const matchingSlot = slots.find((s) => s.time === startDate.toISOString());

  if (!matchingSlot || matchingSlot.staffIds.length === 0) {
    return NextResponse.json(
      { error: "That time is no longer available. Please choose another slot." },
      { status: 409 }
    );
  }

  // Preview mode: no Supabase credentials configured, so there's nowhere to
  // persist a real appointment. Return a self-contained mock booking instead.
  if (!isSupabaseAdminConfigured()) {
    return buildMockBookingResponse({
      serviceId,
      staffId: matchingSlot.staffIds[0],
      startDate,
      clientName,
    });
  }

  let appointment = null;
  let lastError: string | null = null;

  for (const candidateStaffId of matchingSlot.staffIds) {
    const { data, error } = await supabase.rpc("create_appointment", {
      p_staff_id: candidateStaffId,
      p_service_id: serviceId,
      p_start_time: startDate.toISOString(),
      p_client_name: clientName,
      p_client_email: clientEmail,
      p_client_phone: clientPhone,
      p_client_notes: clientNotes ?? null,
    });

    if (!error && data) {
      appointment = Array.isArray(data) ? data[0] : data;
      break;
    }
    lastError = error?.message ?? "Unknown error";
  }

  if (!appointment) {
    if (lastError?.includes("SLOT_TAKEN")) {
      return NextResponse.json(
        { error: "That time was just booked. Please choose another slot." },
        { status: 409 }
      );
    }
    console.error("create_appointment failed", lastError);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }

  // Fetch related info for email + response
  const [{ data: service }, { data: staff }] = await Promise.all([
    supabase.from("services").select("name, price_cents, requires_deposit").eq("id", serviceId).single(),
    supabase.from("staff").select("name").eq("id", appointment.staff_id).single(),
  ]);

  let clientSecret: string | null = null;
  const bookingSettings = await getBookingSettings();

  // Server-side enforcement: color (requires_deposit) services always charge a deposit
  const shouldChargeDeposit = service?.requires_deposit ? true : (payDeposit ?? false);

  if (shouldChargeDeposit && bookingSettings.deposit_amount_cents > 0) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const intent = await stripe.paymentIntents.create({
          amount: bookingSettings.deposit_amount_cents,
          currency: "usd",
          description: `Deposit for ${service?.name ?? "appointment"} — 2Gether Hair Studio`,
          metadata: { appointment_id: appointment.id },
          receipt_email: clientEmail,
        });

        clientSecret = intent.client_secret;

        await supabase
          .from("appointments")
          .update({ stripe_payment_intent_id: intent.id })
          .eq("id", appointment.id);
      } catch (err) {
        console.error("Stripe payment intent error", err);
      }
    }
  }

  try {
    await sendBookingConfirmationEmail({
      to: clientEmail,
      clientName,
      shopName: "2Gether Hair Studio",
      staffName: staff?.name ?? "our team",
      serviceName: service?.name ?? "Appointment",
      priceCents: service?.price_cents ?? 0,
      startTime: new Date(appointment.start_time),
      endTime: new Date(appointment.end_time),
      cancelToken: appointment.cancel_token,
      depositPaid: false,
    });
  } catch (err) {
    console.error("Failed to send confirmation email", err);
  }

  return NextResponse.json({
    appointmentId: appointment.id,
    cancelToken: appointment.cancel_token,
    staffName: staff?.name ?? "our team",
    serviceName: service?.name ?? "Appointment",
    priceCents: service?.price_cents ?? 0,
    startTime: appointment.start_time,
    endTime: appointment.end_time,
    clientSecret,
  });
}

/**
 * Builds a response for a "booking" that can't be persisted because
 * Supabase isn't configured. The appointment details are encoded into the
 * cancel token so the confirmation page can render them without a database.
 */
function buildMockBookingResponse(params: {
  serviceId: string;
  staffId: string;
  startDate: Date;
  clientName: string;
}): NextResponse {
  const { serviceId, staffId, startDate, clientName } = params;

  const service = MOCK_SERVICES.find((s) => s.id === serviceId);
  const staff = MOCK_STAFF.find((s) => s.id === staffId);
  const durationMinutes = service?.duration_minutes ?? 30;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const appointment: AppointmentByTokenResult = {
    id: randomUUID(),
    staff_name: staff?.name ?? "our team",
    service_name: service?.name ?? "Appointment",
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    status: "booked",
    client_name: clientName,
    price_cents: service?.price_cents ?? 0,
    deposit_paid: false,
  };

  return NextResponse.json({
    appointmentId: appointment.id,
    cancelToken: createMockCancelToken(appointment),
    staffName: appointment.staff_name,
    serviceName: appointment.service_name,
    priceCents: appointment.price_cents,
    startTime: appointment.start_time,
    endTime: appointment.end_time,
    clientSecret: null,
  });
}
