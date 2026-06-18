"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StaffFilter({
  basePath,
  date,
  staffId,
  staff,
}: {
  basePath: string;
  date: string;
  staffId: string;
  staff: { id: string; name: string }[];
}) {
  const router = useRouter();

  return (
    <Select
      value={staffId}
      onValueChange={(value) => router.push(`${basePath}?date=${date}&staffId=${value}`)}
    >
      <SelectTrigger className="w-[180px] border-white/10 bg-transparent text-[#F5F5F5]">
        <SelectValue placeholder="All Stylists" />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[#1A1A1A] text-[#F5F5F5]">
        <SelectItem value="all">All Stylists</SelectItem>
        {staff.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
