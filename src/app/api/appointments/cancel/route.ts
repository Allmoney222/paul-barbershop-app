import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCancellationSMS } from "@/lib/twilio";

const cancelSchema = z.object({
  token: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = cancelSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("cancel_appointment_by_token", {
    p_token: parsed.data.token,
  });

  if (error) {
    if (error.message.includes("TOO_LATE")) {
      return NextResponse.json(
        { error: "Appointments can only be cancelled at least 24 hours in advance. Please call the shop." },
        { status: 400 }
      );
    }
    if (error.message.includes("ALREADY_CANCELLED")) {
      return NextResponse.json({ error: "This appointment is already cancelled." }, { status: 400 });
    }
    if (error.message.includes("NOT_FOUND")) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }
    console.error("cancel_appointment_by_token error", error);
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
  }

  // Send cancellation SMS to client (non-blocking)
  if (data) {
    try {
      const appointmentData = Array.isArray(data) ? data[0] : data;
      const { client_phone, client_name, service_name, start_time } = appointmentData;

      if (client_phone) {
        await sendCancellationSMS({
          clientPhone: client_phone,
          clientName: client_name,
          serviceName: service_name,
          startTime: new Date(start_time),
        });
      }
    } catch (err) {
      console.error("Failed to send cancellation SMS", err);
    }
  }

  return NextResponse.json({ appointment: data });
}
