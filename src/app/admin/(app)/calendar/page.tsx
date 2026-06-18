import { DateNav } from "@/components/admin/date-nav";
import { StaffFilter } from "@/components/admin/staff-filter";
import { AppointmentCard } from "@/components/admin/appointment-card";
import { GoldDivider } from "@/components/site/gold-divider";
import { getAllStaff, getAppointmentsInRange } from "@/lib/data/admin";
import { zonedTimeToUtc, todayInTz, getZonedDayOfWeek, formatDateInTz } from "@/lib/timezone";
import { SHOP_TIMEZONE, DAY_LABELS } from "@/lib/constants";
import { formatDateTimeShort } from "@/lib/format";

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; staffId?: string }>;
}) {
  const { date: dateParam, staffId: staffIdParam } = await searchParams;
  const today = todayInTz(SHOP_TIMEZONE);
  const date = dateParam ?? today;
  const staffId = staffIdParam ?? "all";

  const dayOfWeek = getZonedDayOfWeek(date, SHOP_TIMEZONE);
  const weekStart = addDays(date, -dayOfWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const rangeStart = zonedTimeToUtc(weekStart, "00:00:00", SHOP_TIMEZONE);
  const rangeEnd = zonedTimeToUtc(addDays(weekStart, 7), "00:00:00", SHOP_TIMEZONE);

  const [staff, appointments] = await Promise.all([
    getAllStaff(),
    getAppointmentsInRange(rangeStart, rangeEnd, { staffId: staffId === "all" ? undefined : staffId }),
  ]);

  const activeStaff = staff.filter((s) => s.active);

  const weekLabel = `${formatDateTimeShort(zonedTimeToUtc(weekStart, "12:00:00", SHOP_TIMEZONE), SHOP_TIMEZONE).split(",")[0]} – ${
    formatDateTimeShort(zonedTimeToUtc(weekDays[6], "12:00:00", SHOP_TIMEZONE), SHOP_TIMEZONE).split(",")[0]
  }`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Weekly Calendar</h1>
          <p className="mt-1 text-sm text-[#888888]">{weekLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StaffFilter basePath="/admin/calendar" date={date} staffId={staffId} staff={activeStaff} />
          <DateNav basePath="/admin/calendar" date={date} today={today} stepDays={7} label="" />
        </div>
      </div>

      <GoldDivider className="my-6" />

      <div className="grid gap-4 lg:grid-cols-7">
        {weekDays.map((day, i) => {
          const dayAppointments = appointments.filter(
            (a) => formatDateInTz(new Date(a.start_time), SHOP_TIMEZONE) === day
          );
          const isToday = day === today;

          return (
            <div
              key={day}
              className={`rounded-xl border p-3 ${
                isToday ? "border-[#C9A96E]/30 bg-[#C9A96E]/5" : "border-white/5 bg-[#1A1A1A]"
              }`}
            >
              <div className="mb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[#888888]">{DAY_LABELS[i]}</p>
                <p className="font-display text-sm text-[#F5F5F5]">
                  {formatDateTimeShort(zonedTimeToUtc(day, "12:00:00", SHOP_TIMEZONE), SHOP_TIMEZONE).split(",")[0]}
                </p>
              </div>
              <div className="space-y-2">
                {dayAppointments.length === 0 ? (
                  <p className="text-xs text-[#888888]">—</p>
                ) : (
                  dayAppointments.map((appt) => <AppointmentCard key={appt.id} appointment={appt} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
