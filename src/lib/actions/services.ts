"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function serviceFieldsFromForm(formData: FormData) {
  const priceDollars = Number(formData.get("price") ?? 0);

  return {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "Hair"),
    description: String(formData.get("description") ?? "").trim() || null,
    duration_minutes: Number(formData.get("duration_minutes") ?? 30),
    price_cents: Math.round(priceDollars * 100),
    requires_deposit: formData.get("requires_deposit") === "on",
    active: formData.get("active") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

async function syncStaffServices(serviceId: string, staffIds: string[]) {
  const supabase = await createClient();

  await supabase.from("staff_services").delete().eq("service_id", serviceId);

  if (staffIds.length > 0) {
    const rows = staffIds.map((staffId) => ({ staff_id: staffId, service_id: serviceId }));
    const { error } = await supabase.from("staff_services").insert(rows);
    if (error) throw error;
  }
}

export async function createService(formData: FormData) {
  const fields = serviceFieldsFromForm(formData);
  const staffIds = formData.getAll("staff_ids").map(String);

  if (!fields.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { data: service, error } = await supabase.from("services").insert(fields).select("id").single();

  if (error) throw error;

  await syncStaffServices(service.id, staffIds);

  revalidatePath("/admin/services");
  revalidatePath("/");
  redirect("/admin/services");
}

export async function updateService(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing service id");

  const fields = serviceFieldsFromForm(formData);
  const staffIds = formData.getAll("staff_ids").map(String);

  if (!fields.name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("services").update(fields).eq("id", id);

  if (error) throw error;

  await syncStaffServices(id, staffIds);

  revalidatePath("/admin/services");
  revalidatePath("/");
  redirect("/admin/services");
}
