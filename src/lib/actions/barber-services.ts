"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBarberStaff } from "@/lib/supabase/barber-auth";

export async function toggleBarberService(formData: FormData) {
  const currentStaff = await requireBarberStaff();
  const serviceId = String(formData.get("service_id") ?? "");
  const offered = formData.get("offered") === "true";

  if (!serviceId) throw new Error("Missing service_id");

  const supabase = await createClient();

  if (offered) {
    const { error } = await supabase
      .from("staff_services")
      .delete()
      .eq("staff_id", currentStaff.id)
      .eq("service_id", serviceId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("staff_services")
      .upsert({ staff_id: currentStaff.id, service_id: serviceId });
    if (error) throw error;
  }

  revalidatePath("/barber/services");
}
