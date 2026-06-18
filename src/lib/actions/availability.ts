"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateAvailability(formData: FormData) {
  const staffId = String(formData.get("staff_id") ?? "");
  if (!staffId) throw new Error("Missing staff id");

  const supabase = await createClient();

  await supabase.from("availability").delete().eq("staff_id", staffId);

  const rows: { staff_id: string; day_of_week: number; start_time: string; end_time: string }[] = [];

  for (let day = 0; day < 7; day++) {
    const start = String(formData.get(`start_${day}`) ?? "");
    const end = String(formData.get(`end_${day}`) ?? "");
    if (start && end) {
      rows.push({
        staff_id: staffId,
        day_of_week: day,
        start_time: `${start}:00`,
        end_time: `${end}:00`,
      });
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("availability").insert(rows);
    if (error) throw error;
  }

  revalidatePath("/admin/availability");
}

export async function addBlockedTime(formData: FormData) {
  const staffId = String(formData.get("staff_id") ?? "");
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!date) throw new Error("Date is required");

  const supabase = await createClient();
  const { error } = await supabase.from("blocked_times").insert({
    staff_id: staffId || null,
    date,
    start_time: startTime || null,
    end_time: endTime || null,
    reason: reason || null,
  });

  if (error) throw error;

  revalidatePath("/admin/availability");
}

export async function deleteBlockedTime(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const supabase = await createClient();
  const { error } = await supabase.from("blocked_times").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/availability");
}
