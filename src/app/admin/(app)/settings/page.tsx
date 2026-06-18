import { GoldDivider } from "@/components/site/gold-divider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { getShopInfo, getBookingSettings } from "@/lib/data/shop";
import { updateShopInfo, updateBookingSettings } from "@/lib/actions/settings";
import { DAY_LABELS, DAY_LABELS_SHORT } from "@/lib/constants";

const inputClass = "border-white/10 bg-[#0D0D0D] text-[#F5F5F5]";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [shopInfo, bookingSettings] = await Promise.all([getShopInfo(), getBookingSettings()]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Settings</h1>

      <GoldDivider className="my-6" />

      <section>
        <h2 className="font-display text-lg text-[#F5F5F5]">Shop Info</h2>
        <form action={updateShopInfo} className="mt-3 space-y-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[#F5F5F5]">
                Shop Name
              </Label>
              <Input id="name" name="name" defaultValue={shopInfo.name} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tagline" className="text-[#F5F5F5]">
                Tagline
              </Label>
              <Input id="tagline" name="tagline" defaultValue={shopInfo.tagline} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-[#F5F5F5]">
              Address
            </Label>
            <Input id="address" name="address" defaultValue={shopInfo.address} className={inputClass} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[#F5F5F5]">
                Phone
              </Label>
              <Input id="phone" name="phone" defaultValue={shopInfo.phone} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#F5F5F5]">
                Email
              </Label>
              <Input id="email" name="email" type="email" defaultValue={shopInfo.email} className={inputClass} />
            </div>
          </div>

          <input type="hidden" name="timezone" value={shopInfo.timezone} />

          <div className="space-y-2">
            <Label className="text-[#F5F5F5]">Hours</Label>
            <div className="space-y-2">
              {DAY_LABELS.map((label, i) => {
                const key = DAY_LABELS_SHORT[i].toLowerCase();
                return (
                  <div key={key} className="grid grid-cols-[100px_1fr] items-center gap-3">
                    <span className="text-sm text-[#888888]">{label}</span>
                    <Input
                      name={`hours_${key}`}
                      defaultValue={shopInfo.hours[key] ?? ""}
                      placeholder="9:00 AM - 7:00 PM or Closed"
                      className={inputClass}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
            Save Shop Info
          </Button>
        </form>
      </section>

      <GoldDivider className="my-6" />

      <section>
        <h2 className="font-display text-lg text-[#F5F5F5]">Booking Settings</h2>
        <form action={updateBookingSettings} className="mt-3 space-y-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
          <label className="flex items-center gap-2 text-sm text-[#F5F5F5]">
            <input
              type="checkbox"
              name="deposit_enabled"
              defaultChecked={bookingSettings.deposit_enabled}
              className="h-4 w-4 rounded border-white/10 bg-[#0D0D0D] accent-[#C9A96E]"
            />
            Require a deposit to book online
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="deposit_amount" className="text-[#F5F5F5]">
                Deposit Amount (USD)
              </Label>
              <Input
                id="deposit_amount"
                name="deposit_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={(bookingSettings.deposit_amount_cents / 100).toFixed(2)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buffer_minutes" className="text-[#F5F5F5]">
                Buffer Time (minutes)
              </Label>
              <Input
                id="buffer_minutes"
                name="buffer_minutes"
                type="number"
                min="0"
                step="5"
                defaultValue={bookingSettings.buffer_minutes}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slot_increment_minutes" className="text-[#F5F5F5]">
                Slot Increment (minutes)
              </Label>
              <Input
                id="slot_increment_minutes"
                name="slot_increment_minutes"
                type="number"
                min="5"
                step="5"
                defaultValue={bookingSettings.slot_increment_minutes}
                className={inputClass}
              />
            </div>
          </div>

          <Button type="submit" className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
            Save Booking Settings
          </Button>
        </form>
      </section>
    </div>
  );
}
