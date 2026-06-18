import { GoldDivider } from "@/components/site/gold-divider";
import { StaffForm } from "@/components/admin/staff-form";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createStaff } from "@/lib/actions/staff";

export default async function NewStaffPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Add Staff Member</h1>
      <GoldDivider className="my-6" />
      <StaffForm action={createStaff} />
    </div>
  );
}
