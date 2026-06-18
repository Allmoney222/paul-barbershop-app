"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import type { Staff } from "@/types/database";

export function StylistStep({
  staff,
  selectedStaffId,
  onSelect,
}: {
  staff: Staff[];
  selectedStaffId: string | null;
  onSelect: (staffId: string | "any") => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Choose a Stylist</h2>
      <p className="mt-1 text-sm text-[#888888]">
        Pick a specific stylist, or let us find the first available.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card
          onClick={() => onSelect("any")}
          className={cn(
            "flex cursor-pointer items-center gap-4 border-white/5 bg-[#1A1A1A] p-4 transition-colors hover:border-[#C9A96E]/50",
            selectedStaffId === "any" && "border-[#C9A96E] ring-1 ring-[#C9A96E]"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A96E]/10 text-[#C9A96E]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-[#F5F5F5]">No Preference</p>
            <p className="text-xs text-[#888888]">First available stylist</p>
          </div>
        </Card>

        {staff.map((member) => (
          <Card
            key={member.id}
            onClick={() => onSelect(member.id)}
            className={cn(
              "flex cursor-pointer items-center gap-4 border-white/5 bg-[#1A1A1A] p-4 transition-colors hover:border-[#C9A96E]/50",
              selectedStaffId === member.id && "border-[#C9A96E] ring-1 ring-[#C9A96E]"
            )}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.photo_url ?? undefined} alt={member.name} />
              <AvatarFallback className="bg-[#C9A96E]/10 text-[#C9A96E]">
                {member.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-[#F5F5F5]">{member.name}</p>
              {member.specialties.length > 0 && (
                <p className="text-xs text-[#888888]">{member.specialties.join(", ")}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
