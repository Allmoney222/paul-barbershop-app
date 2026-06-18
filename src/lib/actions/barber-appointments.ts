"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBarberStaff } from "@/lib/supabase/barber-auth";
import type { AppointmentStatus } from "@/types/database";
import { APPOINTMENT_STATUSES } from "@/lib/constants";

export async function updateBarberAppointment(formData: FormData) {
  const currentStaff = await requireBarberStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const internalNotes = String(formData.get("internal_notes") ?? "");

  if (!id) throw new Error("Missing appointment id");
  if (!APPOINTMENT_STATUSES.includes(status as AppointmentStatus)) {
    throw new Error("Invalid status");
  }

  const supabase = await createClient();

  // Verify the appointment belongs to this barber before updating
  const { data: appt } = await supabase
    .from("appointments")
    .select("id")
    .eq("id", id)
    .eq("staff_id", currentStaff.id)
    .maybeSingle();

  if (!appt) throw new Error("Appointment not found or access denied");

  const { error } = await supabase
    .from("appointments")
    .update({
      status: status as AppointmentStatus,
      internal_notes: internalNotes.trim() === "" ? null : internalNotes.trim(),
    })
    .eq("id", id);

  if (error) throw error;

  revalidatePath(`/barber/appointments/${id}`);
  revalidatePath("/barber/dashboard");
  revalidatePath("/barber/appointments");
}
