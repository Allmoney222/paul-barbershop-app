import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GoldDivider } from "@/components/site/gold-divider";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { requireBarberStaff } from "@/lib/supabase/barber-auth";
import { getBarberAppointmentById } from "@/lib/data/barber";
import { updateBarberAppointment } from "@/lib/actions/barber-appointments";
import { formatDateLong, formatPrice, formatTime12h } from "@/lib/format";
import { APPOINTMENT_STATUSES, SHOP_TIMEZONE } from "@/lib/constants";

export default async function BarberAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [currentStaff, { id }] = await Promise.all([requireBarberStaff(), params]);
  const appointment = await getBarberAppointmentById(currentStaff.id, id);

  if (!appointment) notFound();

  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/barber/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#F5F5F5]">
        <ArrowLeft className="h-4 w-4" />
        Back to schedule
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Appointment Details</h1>
        <StatusBadge status={appointment.status} />
      </div>

      <GoldDivider className="my-6" />

      <div className="rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
        <Row label="Client" value={appointment.client_name} />
        <Row label="Email" value={appointment.client_email} />
        <Row label="Phone" value={appointment.client_phone} />
        <Row label="Service" value={appointment.service_name} />
        <Row label="Date" value={formatDateLong(start, SHOP_TIMEZONE)} />
        <Row label="Time" value={`${formatTime12h(start, SHOP_TIMEZONE)} - ${formatTime12h(end, SHOP_TIMEZONE)}`} />
        <Row label="Price" value={formatPrice(appointment.service_price_cents)} />
        <Row label="Deposit Paid" value={appointment.deposit_paid ? "Yes" : "No"} />
        <Row label="Client Notes" value={appointment.client_notes ?? "—"} last />
      </div>

      <form action={updateBarberAppointment} className="mt-6 space-y-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
        <input type="hidden" name="id" value={appointment.id} />

        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-[#F5F5F5]">
            Status
          </Label>
          <select
            id="status"
            name="status"
            defaultValue={appointment.status}
            className="flex h-9 w-full rounded-md border border-white/10 bg-[#0D0D0D] px-3 py-1 text-sm text-[#F5F5F5] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="internal_notes" className="text-[#F5F5F5]">
            Internal Notes
          </Label>
          <Textarea
            id="internal_notes"
            name="internal_notes"
            defaultValue={appointment.internal_notes ?? ""}
            rows={4}
            placeholder="Notes visible only to staff..."
            className="border-white/10 bg-[#0D0D0D] text-[#F5F5F5]"
          />
        </div>

        <Button type="submit" className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
          Save Changes
        </Button>
      </form>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2 ${last ? "" : "border-b border-white/5"}`}>
      <span className="text-sm text-[#888888]">{label}</span>
      <span className="text-right text-sm font-medium text-[#F5F5F5]">{value}</span>
    </div>
  );
}
