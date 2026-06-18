import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = ["Service", "Stylist", "Time", "Details", "Confirm"];

export function BookingProgress({ step }: { step: number }) {
  return (
    <ol className="mb-10 flex items-center justify-between">
      {STEPS.map((label, i) => {
        const stepNumber = i + 1;
        const isComplete = stepNumber < step;
        const isCurrent = stepNumber === step;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isComplete && "border-[#C9A96E] bg-[#C9A96E] text-[#0D0D0D]",
                  isCurrent && "border-[#C9A96E] text-[#C9A96E]",
                  !isComplete && !isCurrent && "border-white/10 text-[#888888]"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  isCurrent ? "text-[#F5F5F5]" : "text-[#888888]"
                )}
              >
                {label}
              </span>
            </div>
            {stepNumber !== STEPS.length && (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  isComplete ? "bg-[#C9A96E]" : "bg-white/10"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
