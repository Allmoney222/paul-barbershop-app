import { GoldDivider } from "@/components/site/gold-divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvailabilityStaffSelect } from "@/components/admin/availability-staff-select";
import { requireStaff } from "@/lib/supabase/admin-auth";
import { getAllStaff } from "@/lib/data/admin";
import { updateAvailability, addBlockedTime, deleteBlockedTime } from "@/lib/actions/availability";
import { createClient } from "@/lib/supabase/server";
import { DAY_LABELS } from "@/lib/constants";
import { formatDateLong } from "@/lib/format";

const inputClass = "border-white/10 bg-[#0D0D0D] text-[#F5F5F5]";

export default async function AdminAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ staffId?: string }>;
}) {
  const currentStaff = await requireStaff();
  const { staffId: staffIdParam } = await searchParams;
  const isAdmin = currentStaff.role === "admin";

  const allStaff = isAdmin ? await getAllStaff() : [];
  const targetStaffId = isAdmin ? staffIdParam ?? currentStaff.id : currentStaff.id;
  const targetStaff = isAdmin ? allStaff.find((s) => s.id === targetStaffId) ?? currentStaff : currentStaff;

  const supabase = await createClient();
  const [{ data: availability }, { data: blockedTimes }] = await Promise.all([
    supabase.from("availability").select("*").eq("staff_id", targetStaffId).order("day_of_week", { ascending: true }),
    isAdmin
      ? supabase
          .from("blocked_times")
          .select("*")
          .or(`staff_id.eq.${targetStaffId},staff_id.is.null`)
          .order("date", { ascending: true })
      : supabase.from("blocked_times").select("*").eq("staff_id", targetStaffId).order("date", { ascending: true }),
  ]);

  const availabilityByDay = new Map((availability ?? []).map((a) => [a.day_of_week, a]));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Availability</h1>
        {isAdmin && <AvailabilityStaffSelect staffId={targetStaffId} staff={allStaff} />}
      </div>
      <p className="mt-1 text-sm text-[#888888]">
        Weekly hours and blocked dates for {targetStaff?.name ?? "this staff member"}.
      </p>

      <GoldDivider className="my-6" />

      <section>
        <h2 className="font-display text-lg text-[#F5F5F5]">Weekly Hours</h2>
        <form action={updateAvailability} className="mt-3 space-y-3 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
          <input type="hidden" name="staff_id" value={targetStaffId} />
          {DAY_LABELS.map((label, day) => {
            const row = availabilityByDay.get(day);
            return (
              <div key={day} className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[120px_1fr_1fr]">
                <Label className="text-[#F5F5F5]">{label}</Label>
                <Input
                  type="time"
                  name={`start_${day}`}
                  defaultValue={row?.start_time?.slice(0, 5) ?? ""}
                  className={inputClass}
                />
                <Input
                  type="time"
                  name={`end_${day}`}
                  defaultValue={row?.end_time?.slice(0, 5) ?? ""}
                  className={inputClass}
                />
              </div>
            );
          })}
          <p className="text-xs text-[#888888]">Leave both times empty for a day to mark it closed.</p>
          <Button type="submit" className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
            Save Hours
          </Button>
        </form>
      </section>

      <GoldDivider className="my-6" />

      <section>
        <h2 className="font-display text-lg text-[#F5F5F5]">Blocked Dates</h2>
        <p className="mt-1 text-sm text-[#888888]">
          Block time off (vacations, appointments) or, as an admin, close the shop entirely for a date.
        </p>

        <form action={addBlockedTime} className="mt-3 space-y-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-[#F5F5F5]">
                Date
              </Label>
              <Input id="date" type="date" name="date" required className={inputClass} />
            </div>
            {isAdmin && (
              <div className="space-y-1.5">
                <Label htmlFor="staff_id_block" className="text-[#F5F5F5]">
                  Applies To
                </Label>
                <select
                  id="staff_id_block"
                  name="staff_id"
                  defaultValue={targetStaffId}
                  className="flex h-9 w-full rounded-md border border-white/10 bg-[#0D0D0D] px-3 py-1 text-sm text-[#F5F5F5] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {allStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                  <option value="">Entire Shop (all staff)</option>
                </select>
              </div>
            )}
            {!isAdmin && <input type="hidden" name="staff_id" value={targetStaffId} />}
            <div className="space-y-1.5">
              <Label htmlFor="start_time" className="text-[#F5F5F5]">
                Start Time (optional)
              </Label>
              <Input id="start_time" type="time" name="start_time" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_time" className="text-[#F5F5F5]">
                End Time (optional)
              </Label>
              <Input id="end_time" type="time" name="end_time" className={inputClass} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-[#F5F5F5]">
              Reason (optional)
            </Label>
            <Input id="reason" name="reason" placeholder="Vacation, holiday, etc." className={inputClass} />
          </div>
          <p className="text-xs text-[#888888]">Leave start/end time empty to block the entire day.</p>
          <Button type="submit" className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
            Add Blocked Time
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          {(blockedTimes ?? []).length === 0 ? (
            <p className="text-sm text-[#888888]">No blocked dates.</p>
          ) : (
            (blockedTimes ?? []).map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-[#1A1A1A] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#F5F5F5]">
                    {formatDateLong(new Date(`${block.date}T12:00:00Z`), "America/New_York")}
                    {block.staff_id === null && (
                      <span className="ml-2 text-xs text-[#C9A96E]">Entire Shop</span>
                    )}
                  </p>
                  <p className="text-xs text-[#888888]">
                    {block.start_time && block.end_time
                      ? `${block.start_time.slice(0, 5)} - ${block.end_time.slice(0, 5)}`
                      : "All day"}
                    {block.reason ? ` · ${block.reason}` : ""}
                  </p>
                </div>
                <form action={deleteBlockedTime}>
                  <input type="hidden" name="id" value={block.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    Remove
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
