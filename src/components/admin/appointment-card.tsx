import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatTime12h } from "@/lib/format";
import { SHOP_TIMEZONE } from "@/lib/constants";
import type { AppointmentWithDetails } from "@/lib/data/admin";

export function AppointmentCard({ appointment }: { appointment: AppointmentWithDetails }) {
  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  const isCancelled = appointment.status === "cancelled";

  return (
    <Link
      href={`/admin/appointments/${appointment.id}`}
      className={`block rounded-lg border border-white/5 bg-[#0D0D0D] p-3 transition-colors hover:border-[#C9A96E]/30 ${
        isCancelled ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[#F5F5F5]">
          {formatTime12h(start, SHOP_TIMEZONE)} &ndash; {formatTime12h(end, SHOP_TIMEZONE)}
        </span>
        <StatusBadge status={appointment.status} />
      </div>
      <p className="mt-1.5 text-sm text-[#F5F5F5]">{appointment.client_name}</p>
      <p className="text-xs text-[#888888]">{appointment.service_name}</p>
    </Link>
  );
}
