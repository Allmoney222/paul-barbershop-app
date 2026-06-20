"use client";

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
}: {
  service: Service;
  staff: Staff | null; // null = "no preference"
  time: string; // ISO
  details: ClientDetails;
  bookingSettings: BookingSettings;
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

      {service.requires_deposit && bookingSettings.deposit_amount_cents > 0 && (
        <div className="mt-6 rounded-xl border border-[#C9A96E]/30 bg-[#C9A96E]/5 p-5">
          <p className="text-sm font-medium text-[#C9A96E]">Deposit required</p>
          <p className="mt-1 text-sm text-[#F5F5F5]">
            A {formatPrice(bookingSettings.deposit_amount_cents)} deposit is required to hold this
            appointment. You will pay the remaining balance at the shop.
          </p>
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
