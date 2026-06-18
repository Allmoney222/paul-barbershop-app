"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatTime12h } from "@/lib/format";
import { formatDateInTz, todayInTz } from "@/lib/timezone";
import { SHOP_TIMEZONE } from "@/lib/constants";

interface SlotResult {
  time: string;
  staffIds: string[];
}

export function DateTimeStep({
  serviceId,
  staffId,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: {
  serviceId: string;
  staffId: string;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}) {
  const [slots, setSlots] = useState<SlotResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/availability?serviceId=${serviceId}&staffId=${staffId}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setSlots([]);
        } else {
          setSlots(data.slots ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load available times.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, staffId, selectedDate]);

  const today = todayInTz(SHOP_TIMEZONE);
  const todayDate = new Date(`${today}T00:00:00`);
  // Allow booking up to 60 days out
  const maxDate = new Date(todayDate);
  maxDate.setDate(maxDate.getDate() + 60);

  return (
    <div>
      <h2 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Pick a Date &amp; Time</h2>
      <p className="mt-1 text-sm text-[#888888]">All times shown in Eastern Time (Buffalo, NY).</p>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <div className="rounded-xl border border-white/5 bg-[#1A1A1A] p-2">
          <Calendar
            mode="single"
            selected={selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined}
            onSelect={(date) => {
              if (!date) return;
              onSelectDate(formatDateInTz(date, SHOP_TIMEZONE));
            }}
            disabled={(date) => date < todayDate || date > maxDate}
            className="text-[#F5F5F5]"
          />
        </div>

        <div className="flex-1">
          {!selectedDate && (
            <p className="text-sm text-[#888888]">Select a date to see available times.</p>
          )}

          {selectedDate && loading && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 bg-white/5" />
              ))}
            </div>
          )}

          {selectedDate && !loading && error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {selectedDate && !loading && !error && slots.length === 0 && (
            <p className="text-sm text-[#888888]">
              No available times on this date. Please choose another day.
            </p>
          )}

          {selectedDate && !loading && !error && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const date = new Date(slot.time);
                const isSelected = selectedTime === slot.time;
                return (
                  <Button
                    key={slot.time}
                    type="button"
                    variant="outline"
                    onClick={() => onSelectTime(slot.time)}
                    className={cn(
                      "border-white/10 bg-transparent text-[#F5F5F5] hover:bg-[#C9A96E]/10 hover:text-[#F5F5F5]",
                      isSelected && "border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]"
                    )}
                  >
                    {formatTime12h(date, SHOP_TIMEZONE)}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
