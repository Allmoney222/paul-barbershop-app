import { DateNav } from "@/components/admin/date-nav";
import { GoldDivider } from "@/components/site/gold-divider";
import { requireBarberStaff } from "@/lib/supabase/barber-auth";
import { getBarberAppointmentsInRange } from "@/lib/data/barber";
import { zonedTimeToUtc, todayInTz } from "@/lib/timezone";
import { formatDateLong, formatTime12h, formatPrice } from "@/lib/format";
import { SHOP_TIMEZONE } from "@/lib/constants";
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function BarberDashboardPage({
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

  const rangeStart = zonedTimeToUtc(date, "00:00:00", SHOP_TIMEZONE);
  const rangeEnd = zonedTimeToUtc(addDays(date, 1), "00:00:00", SHOP_TIMEZONE);

  const appointments = await getBarberAppointmentsInRange(currentStaff.id, rangeStart, rangeEnd);
  const referenceDate = zonedTimeToUtc(date, "12:00:00", SHOP_TIMEZONE);

  const active = appointments.filter((a) => a.status !== "cancelled");
  const revenue = active
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.service_price_cents, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">My Schedule</h1>
          <p className="mt-1 text-sm text-[#888888]">{formatDateLong(referenceDate, SHOP_TIMEZONE)}</p>
        </div>
        <DateNav basePath="/barber/dashboard" date={date} today={today} label={date === today ? "Today" : ""} />
      </div>

      <GoldDivider className="my-6" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Appointments" value={String(active.length)} />
        <StatCard label="Completed" value={String(appointments.filter((a) => a.status === "completed").length)} />
        <StatCard label="Revenue" value={formatPrice(revenue)} className="col-span-2 sm:col-span-1" />
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm text-[#888888]">No appointments scheduled for this day.</p>
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[#F5F5F5]">
                    {formatTime12h(start, SHOP_TIMEZONE)} &ndash; {formatTime12h(end, SHOP_TIMEZONE)}
                  </span>
                  <StatusBadge status={appt.status} />
                </div>
                <p className="mt-1 font-medium text-[#F5F5F5]">{appt.client_name}</p>
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

function StatCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/5 bg-[#1A1A1A] p-4 ${className ?? ""}`}>
      <p className="text-xs text-[#888888]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#F5F5F5]">{value}</p>
    </div>
  );
}
