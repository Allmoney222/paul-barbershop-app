"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function DateNav({
  basePath,
  date,
  today,
  stepDays = 1,
  label,
}: {
  basePath: string;
  date: string;
  today: string;
  stepDays?: number;
  label: string;
}) {
  const router = useRouter();

  function go(newDate: string) {
    router.push(`${basePath}?date=${newDate}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5]"
        onClick={() => go(addDays(date, -stepDays))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5]"
        onClick={() => go(today)}
      >
        Today
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5]"
        onClick={() => go(addDays(date, stepDays))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="ml-2 text-sm text-[#888888]">{label}</span>
    </div>
  );
}
