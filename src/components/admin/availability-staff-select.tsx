"use client";

import { useRouter } from "next/navigation";

export function AvailabilityStaffSelect({
  staffId,
  staff,
}: {
  staffId: string;
  staff: { id: string; name: string }[];
}) {
  const router = useRouter();

  return (
    <select
      value={staffId}
      onChange={(e) => router.push(`/admin/availability?staffId=${e.target.value}`)}
      className="flex h-9 w-[200px] rounded-md border border-white/10 bg-[#0D0D0D] px-3 py-1 text-sm text-[#F5F5F5] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {staff.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </select>
  );
}
