import Link from "next/link";
import { Plus } from "lucide-react";
import { GoldDivider } from "@/components/site/gold-divider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { getAllStaff } from "@/lib/data/admin";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin (Owner)",
  barber: "Barber",
  stylist: "Stylist",
};

export default async function AdminStaffPage() {
  await requireAdmin();
  const staff = await getAllStaff();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Staff</h1>
        <Button asChild className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
          <Link href="/admin/staff/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Link>
        </Button>
      </div>

      <GoldDivider className="my-6" />

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#1A1A1A]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="text-[#888888]">Name</TableHead>
              <TableHead className="text-[#888888]">Role</TableHead>
              <TableHead className="text-[#888888]">Email</TableHead>
              <TableHead className="text-[#888888]">Status</TableHead>
              <TableHead className="text-[#888888]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id} className="border-white/5">
                <TableCell className="font-medium text-[#F5F5F5]">{member.name}</TableCell>
                <TableCell className="text-[#888888]">{ROLE_LABELS[member.role] ?? member.role}</TableCell>
                <TableCell className="text-[#888888]">{member.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      member.active
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-white/5 text-[#888888]"
                    }
                  >
                    {member.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/staff/${member.id}`} className="text-sm text-[#C9A96E] hover:underline">
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
