import { GoldDivider } from "@/components/site/gold-divider";
import { ServiceForm } from "@/components/admin/service-form";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createService } from "@/lib/actions/services";
import { getAllStaff } from "@/lib/data/admin";

export default async function NewServicePage() {
  await requireAdmin();
  const allStaff = await getAllStaff();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Add Service</h1>
      <GoldDivider className="my-6" />
      <ServiceForm allStaff={allStaff} assignedStaffIds={[]} action={createService} />
    </div>
  );
}
