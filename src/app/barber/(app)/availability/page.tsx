import { GoldDivider } from "@/components/site/gold-divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireBarberStaff } from "@/lib/supabase/barber-auth";
import {
  updateBarberAvailability,
  addBarberBlockedTime,
  deleteBarberBlockedTime,
} from "@/lib/actions/barber-availability";
import { createClient } from "@/lib/supabase/server";
import { DAY_LABELS } from "@/lib/constants";
import { formatDateLong } from "@/lib/format";

const inputClass = "border-white/10 bg-[#0D0D0D] text-[#F5F5F5]";

export default async function BarberAvailabilityPage() {
  const currentStaff = await requireBarberStaff();

  const supabase = await createClient();
  const [{ data: availability }, { data: blockedTimes }] = await Promise.all([
    supabase
      .from("availability")
      .select("*")
      .eq("staff_id", currentStaff.id)
      .order("day_of_week", { ascending: true }),
    supabase
      .from("blocked_times")
      .select("*")
      .eq("staff_id", currentStaff.id)
      .order("date", { ascending: true }),
  ]);

  const availabilityByDay = new Map((availability ?? []).map((a) => [a.day_of_week, a]));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">My Availability</h1>
      <p className="mt-1 text-sm text-[#888888]">Set your weekly working hours and block time off.</p>

      <GoldDivider className="my-6" />

      <section>
        <h2 className="font-display text-lg text-[#F5F5F5]">Weekly Hours</h2>
        <form action={updateBarberAvailability} className="mt-3 space-y-3 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
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
          Block time off for vacations, breaks, or personal appointments.
        </p>

        <form action={addBarberBlockedTime} className="mt-3 space-y-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-[#F5F5F5]">
                Date
              </Label>
              <Input id="date" type="date" name="date" required className={inputClass} />
            </div>
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
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-[#F5F5F5]">
                Reason (optional)
              </Label>
              <Input id="reason" name="reason" placeholder="Vacation, holiday, etc." className={inputClass} />
            </div>
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
                  </p>
                  <p className="text-xs text-[#888888]">
                    {block.start_time && block.end_time
                      ? `${block.start_time.slice(0, 5)} - ${block.end_time.slice(0, 5)}`
                      : "All day"}
                    {block.reason ? ` · ${block.reason}` : ""}
                  </p>
                </div>
                <form action={deleteBarberBlockedTime}>
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
