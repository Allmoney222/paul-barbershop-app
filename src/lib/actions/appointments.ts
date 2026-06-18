"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/types/database";
import { APPOINTMENT_STATUSES } from "@/lib/constants";

export async function updateAppointment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const internalNotes = String(formData.get("internal_notes") ?? "");

  if (!id) throw new Error("Missing appointment id");
  if (!APPOINTMENT_STATUSES.includes(status as AppointmentStatus)) {
    throw new Error("Invalid status");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({
      status: status as AppointmentStatus,
      internal_notes: internalNotes.trim() === "" ? null : internalNotes.trim(),
    })
    .eq("id", id);

  if (error) throw error;

  revalidatePath(`/admin/appointments/${id}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/clients");
}
