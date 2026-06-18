import Link from "next/link";
import { GoldDivider } from "@/components/site/gold-divider";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireBarberStaff } from "@/lib/supabase/barber-auth";
import { getBarberAppointmentsInRange } from "@/lib/data/barber";
import { zonedTimeToUtc, todayInTz } from "@/lib/timezone";
import { formatDateLong, formatTime12h, formatPrice } from "@/lib/format";
import { SHOP_TIMEZONE } from "@/lib/constants";
import { DateNav } from "@/components/admin/date-nav";

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function BarberAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const [currentStaff, { date: dateParam }] = await Promise.all([
    requireBarberStaff(),
    searchParams,
  ]);

  const today = todayInTz(SHOP_TIMEZONE);
  const date = dateParam ?? today;

  // Show 7 days starting from the selected date
  const rangeStart = zonedTimeToUtc(date, "00:00:00", SHOP_TIMEZONE);
  const rangeEnd = zonedTimeToUtc(addDays(date, 7), "00:00:00", SHOP_TIMEZONE);

  const appointments = await getBarberAppointmentsInRange(currentStaff.id, rangeStart, rangeEnd);
  const referenceDate = zonedTimeToUtc(date, "12:00:00", SHOP_TIMEZONE);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Appointments</h1>
          <p className="mt-1 text-sm text-[#888888]">
            Week of {formatDateLong(referenceDate, SHOP_TIMEZONE)}
          </p>
        </div>
        <DateNav
          basePath="/barber/appointments"
          date={date}
          today={today}
          stepDays={7}
          label={date === today ? "This Week" : ""}
        />
      </div>

      <GoldDivider className="my-6" />

      {appointments.length === 0 ? (
        <p className="text-sm text-[#888888]">No appointments this week.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const start = new Date(appt.start_time);
            const end = new Date(appt.end_time);
            const isCancelled = appt.status === "cancelled";
            return (
              <Link
                key={appt.id}
                href={`/barber/appointments/${appt.id}`}
                className={`block rounded-xl border border-white/5 bg-[#1A1A1A] p-4 transition-colors hover:border-[#C9A96E]/30 ${isCancelled ? "opacity-50" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-[#888888]">{formatDateLong(start, SHOP_TIMEZONE)}</p>
                    <p className="mt-0.5 text-sm font-medium text-[#F5F5F5]">
                      {formatTime12h(start, SHOP_TIMEZONE)} &ndash; {formatTime12h(end, SHOP_TIMEZONE)}
                    </p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
                <p className="mt-2 font-medium text-[#F5F5F5]">{appt.client_name}</p>
                <p className="text-sm text-[#888888]">
                  {appt.service_name} &middot; {formatPrice(appt.service_price_cents)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
