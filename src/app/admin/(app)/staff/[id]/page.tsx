import { notFound } from "next/navigation";
import { GoldDivider } from "@/components/site/gold-divider";
import { StaffForm } from "@/components/admin/staff-form";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { updateStaff } from "@/lib/actions/staff";
import { createClient } from "@/lib/supabase/server";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const { data: staff } = await supabase.from("staff").select("*").eq("id", id).maybeSingle();

  if (!staff) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Edit {staff.name}</h1>
      <GoldDivider className="my-6" />
      <StaffForm staff={staff} action={updateStaff} />
    </div>
  );
}
