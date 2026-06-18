import { notFound } from "next/navigation";
import { GoldDivider } from "@/components/site/gold-divider";
import { ServiceForm } from "@/components/admin/service-form";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { updateService } from "@/lib/actions/services";
import { getAllStaff } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: service }, allStaff, { data: staffServices }] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).maybeSingle(),
    getAllStaff(),
    supabase.from("staff_services").select("staff_id").eq("service_id", id),
  ]);

  if (!service) notFound();

  const assignedStaffIds = (staffServices ?? []).map((row) => row.staff_id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Edit {service.name}</h1>
      <GoldDivider className="my-6" />
      <ServiceForm service={service} allStaff={allStaff} assignedStaffIds={assignedStaffIds} action={updateService} />
    </div>
  );
}
