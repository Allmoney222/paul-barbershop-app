"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffRole } from "@/types/database";

const ROLES: StaffRole[] = ["admin", "stylist", "barber"];

function parseSpecialties(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function staffFieldsFromForm(formData: FormData) {
  const role = String(formData.get("role") ?? "stylist");

  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    photo_url: String(formData.get("photo_url") ?? "").trim() || null,
    specialties: parseSpecialties(String(formData.get("specialties") ?? "")),
    role: (ROLES.includes(role as StaffRole) ? role : "stylist") as StaffRole,
    active: formData.get("active") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

export async function createStaff(formData: FormData) {
  const fields = staffFieldsFromForm(formData);
  const sendInvite = formData.get("send_invite") === "on";

  if (!fields.name || !fields.email) {
    throw new Error("Name and email are required");
  }

  const supabase = await createClient();
  const { data: staff, error } = await supabase.from("staff").insert(fields).select("id").single();

  if (error) throw error;

  if (sendInvite) {
    const admin = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(fields.email, {
      redirectTo: `${appUrl}/admin/login`,
    });

    if (!inviteError && invited.user) {
      await supabase.from("staff").update({ auth_user_id: invited.user.id }).eq("id", staff.id);
    }
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function updateStaff(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing staff id");

  const fields = staffFieldsFromForm(formData);

  if (!fields.name || !fields.email) {
    throw new Error("Name and email are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("staff").update(fields).eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/staff");
  revalidatePath("/");
  redirect("/admin/staff");
}
