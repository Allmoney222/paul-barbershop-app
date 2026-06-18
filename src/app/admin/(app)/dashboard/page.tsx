import { DateNav } from "@/components/admin/date-nav";
import { AppointmentCard } from "@/components/admin/appointment-card";
import { GoldDivider } from "@/components/site/gold-divider";
import { getAllStaff, getAppointmentsInRange } from "@/lib/data/admin";
import { zonedTimeToUtc, todayInTz } from "@/lib/timezone";
import { formatDateLong } from "@/lib/format";
import { SHOP_TIMEZONE } from "@/lib/constants";

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const today = todayInTz(SHOP_TIMEZONE);
  const date = dateParam ?? today;

  const rangeStart = zonedTimeToUtc(date, "00:00:00", SHOP_TIMEZONE);
  const rangeEnd = zonedTimeToUtc(addDays(date, 1), "00:00:00", SHOP_TIMEZONE);

  const [staff, appointments] = await Promise.all([
    getAllStaff(),
    getAppointmentsInRange(rangeStart, rangeEnd),
  ]);

  const activeStaff = staff.filter((s) => s.active);
  const referenceDate = zonedTimeToUtc(date, "12:00:00", SHOP_TIMEZONE);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Today&apos;s Schedule</h1>
          <p className="mt-1 text-sm text-[#888888]">{formatDateLong(referenceDate, SHOP_TIMEZONE)}</p>
        </div>
        <DateNav basePath="/admin/dashboard" date={date} today={today} label={date === today ? "Today" : ""} />
      </div>

      <GoldDivider className="my-6" />

      {activeStaff.length === 0 ? (
        <p className="text-sm text-[#888888]">No active staff members yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeStaff.map((member) => {
            const memberAppointments = appointments.filter((a) => a.staff_id === member.id);
            return (
              <div key={member.id} className="rounded-xl border border-white/5 bg-[#1A1A1A] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg text-[#F5F5F5]">{member.name}</h2>
                  <span className="text-xs text-[#888888]">
                    {memberAppointments.length} appt{memberAppointments.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {memberAppointments.length === 0 ? (
                    <p className="text-sm text-[#888888]">No appointments.</p>
                  ) : (
                    memberAppointments.map((appt) => <AppointmentCard key={appt.id} appointment={appt} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
