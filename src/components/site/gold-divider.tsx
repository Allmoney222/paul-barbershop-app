import { cn } from "@/lib/utils";

export function GoldDivider({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn("gold-divider", className)}
    />
  );
}
