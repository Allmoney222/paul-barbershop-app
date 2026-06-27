import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReminderSMS } from "@/lib/twilio";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id, client_name, client_phone, service_id, staff_id, start_time, status")
    .in("status", ["booked", "confirmed"])
    .gte("start_time", windowStart.toISOString())
    .lte("start_time", windowEnd.toISOString());

  if (error) {
    console.error("Failed to fetch appointments for reminders", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const staffIds = [...new Set(appointments.map((a) => a.staff_id))];
  const serviceIds = [...new Set(appointments.map((a) => a.service_id))];

  const [{ data: staffRows }, { data: serviceRows }] = await Promise.all([
    supabase.from("staff").select("id, name").in("id", staffIds),
    supabase.from("services").select("id, name").in("id", serviceIds),
  ]);

  const staffMap = Object.fromEntries((staffRows ?? []).map((s) => [s.id, s.name]));
  const serviceMap = Object.fromEntries((serviceRows ?? []).map((s) => [s.id, s.name]));

  let sent = 0;
  let failed = 0;

  for (const appt of appointments) {
    const staffName = staffMap[appt.staff_id] ?? "your stylist";
    const serviceName = serviceMap[appt.service_id] ?? "your appointment";

    const ok = await sendReminderSMS({
      clientPhone: appt.client_phone,
      clientName: appt.client_name,
      serviceName,
      staffName,
      startTime: new Date(appt.start_time),
    });

    if (ok) {
      sent++;
    } else {
      failed++;
    }
  }

  console.log(`Reminder SMS job complete: ${sent} sent, ${failed} failed`);
  return NextResponse.json({ sent, failed });
}
