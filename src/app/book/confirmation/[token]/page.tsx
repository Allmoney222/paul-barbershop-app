import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, CalendarPlus } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { GoldDivider } from "@/components/site/gold-divider";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/booking/cancel-button";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { decodeMockCancelToken, isMockCancelToken } from "@/lib/booking/mock-booking";
import { formatDateLong, formatPrice, formatTime12h } from "@/lib/format";
import { generateIcsDataUri, googleCalendarUrl } from "@/lib/calendar";
import { SHOP_TIMEZONE, DEFAULT_SHOP_INFO } from "@/lib/constants";
import type { AppointmentByTokenResult } from "@/types/database";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const data = isMockCancelToken(token)
    ? decodeMockCancelToken(token)
    : await fetchAppointmentByToken(token);

  if (!data) {
    notFound();
  }

  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  const isCancelled = data.status === "cancelled";
  const canCancel = !isCancelled && start.getTime() - Date.now() > 24 * 60 * 60 * 1000;

  const calendarTitle = `${data.service_name} at ${DEFAULT_SHOP_INFO.name}`;
  const calendarDescription = `Appointment with ${data.staff_name} for ${data.service_name}.`;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <SiteHeader />
      <main className="container mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A96E]/10">
            {isCancelled ? (
              <span className="font-display text-2xl text-red-400">&times;</span>
            ) : (
              <CheckCircle2 className="h-7 w-7 text-[#C9A96E]" />
            )}
          </div>
          <h1 className="font-display text-3xl text-[#F5F5F5] sm:text-4xl">
            {isCancelled ? "Appointment Cancelled" : "You're Booked!"}
          </h1>
          <p className="mt-2 text-sm text-[#888888]">
            {isCancelled
              ? "This appointment has been cancelled."
              : `A confirmation email is on its way to you.`}
          </p>
        </div>

        <GoldDivider className="my-8" />

        <div className="rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
          <Row label="Service" value={data.service_name} />
          <Row label="Stylist" value={data.staff_name} />
          <Row label="Date" value={formatDateLong(start, SHOP_TIMEZONE)} />
          <Row label="Time" value={`${formatTime12h(start, SHOP_TIMEZONE)} - ${formatTime12h(end, SHOP_TIMEZONE)}`} />
          <Row label="Price" value={formatPrice(data.price_cents)} />
          <Row label="Status" value={statusLabel(data.status)} last />
        </div>

        {!isCancelled && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="flex-1 border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5]"
            >
              <a
                href={googleCalendarUrl({
                  title: calendarTitle,
                  description: calendarDescription,
                  location: DEFAULT_SHOP_INFO.address,
                  start,
                  end,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add to Google Calendar
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5]"
            >
              <a
                download="appointment.ics"
                href={generateIcsDataUri({
                  title: calendarTitle,
                  description: calendarDescription,
                  location: DEFAULT_SHOP_INFO.address,
                  start,
                  end,
                  uid: data.id,
                })}
              >
                <Download className="mr-2 h-4 w-4" />
                Download .ics
              </a>
            </Button>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          {canCancel && <CancelButton token={token} canCancel={canCancel} />}
          {!isCancelled && !canCancel && (
            <p className="text-center text-xs text-[#888888]">
              This appointment can no longer be cancelled online (within 24 hours of the
              appointment). Please call {DEFAULT_SHOP_INFO.phone} if you need to make changes.
            </p>
          )}
          <Link href="/" className="text-sm text-[#C9A96E] underline-offset-4 hover:underline">
            Return to home
          </Link>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${last ? "" : "border-b border-white/5"}`}>
      <span className="text-sm text-[#888888]">{label}</span>
      <span className="text-sm font-medium text-[#F5F5F5]">{value}</span>
    </div>
  );
}

async function fetchAppointmentByToken(token: string): Promise<AppointmentByTokenResult | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc("get_appointment_by_cancel_token", { p_token: token })
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  } catch (error) {
    console.error("fetchAppointmentByToken failed", error);
    return null;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "booked":
      return "Booked";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "no-show":
      return "No-show";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}
