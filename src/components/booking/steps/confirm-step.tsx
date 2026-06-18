"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { GoldDivider } from "@/components/site/gold-divider";
import { formatDuration, formatPrice, formatTime12h, formatDateLong } from "@/lib/format";
import { SHOP_TIMEZONE } from "@/lib/constants";
import type { BookingSettings, Service, Staff } from "@/types/database";
import type { ClientDetails } from "@/components/booking/steps/details-step";

export function ConfirmStep({
  service,
  staff,
  time,
  details,
  bookingSettings,
  payDeposit,
  onPayDepositChange,
}: {
  service: Service;
  staff: Staff | null; // null = "no preference"
  time: string; // ISO
  details: ClientDetails;
  bookingSettings: BookingSettings;
  payDeposit: boolean;
  onPayDepositChange: (value: boolean) => void;
}) {
  const date = new Date(time);

  return (
    <div>
      <h2 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Confirm Your Booking</h2>
      <p className="mt-1 text-sm text-[#888888]">Review the details below before confirming.</p>

      <div className="mt-6 rounded-xl border border-white/5 bg-[#1A1A1A] p-5">
        <SummaryRow label="Service" value={service.name} />
        <SummaryRow label="Stylist" value={staff ? staff.name : "First available"} />
        <SummaryRow label="Date" value={formatDateLong(date, SHOP_TIMEZONE)} />
        <SummaryRow label="Time" value={formatTime12h(date, SHOP_TIMEZONE)} />
        <SummaryRow label="Duration" value={formatDuration(service.duration_minutes)} />
        <SummaryRow label="Price" value={formatPrice(service.price_cents)} last />

        <GoldDivider className="my-4" />

        <SummaryRow label="Name" value={details.clientName} />
        <SummaryRow label="Phone" value={details.clientPhone} />
        <SummaryRow label="Email" value={details.clientEmail} last={!details.clientNotes} />
        {details.clientNotes && <SummaryRow label="Note" value={details.clientNotes} last />}
      </div>

      {bookingSettings.deposit_enabled && bookingSettings.deposit_amount_cents > 0 && (
        <div className="mt-6 rounded-xl border border-[#C9A96E]/20 bg-[#C9A96E]/5 p-5">
          <label className="flex items-start gap-3">
            <Checkbox
              checked={payDeposit}
              onCheckedChange={(checked) => onPayDepositChange(checked === true)}
              className="mt-0.5 border-[#C9A96E]/50 data-[state=checked]:bg-[#C9A96E] data-[state=checked]:text-[#0D0D0D]"
            />
            <span className="text-sm text-[#F5F5F5]">
              Pay a {formatPrice(bookingSettings.deposit_amount_cents)} deposit now to hold this
              appointment.{" "}
              <span className="text-[#888888]">
                You can also leave this unchecked and pay the full amount at the shop.
              </span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2 ${last ? "" : "border-b border-white/5"}`}>
      <span className="text-sm text-[#888888]">{label}</span>
      <span className="text-right text-sm font-medium text-[#F5F5F5]">{value}</span>
    </div>
  );
}
