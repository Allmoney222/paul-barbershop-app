import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/database";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  booked: "border-[#C9A96E]/30 bg-[#C9A96E]/10 text-[#C9A96E]",
  confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  completed: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  "no-show": "border-orange-500/30 bg-orange-500/10 text-orange-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: "Booked",
  confirmed: "Confirmed",
  completed: "Completed",
  "no-show": "No-show",
  cancelled: "Cancelled",
};

export function StatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
