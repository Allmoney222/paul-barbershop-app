"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendStaffInviteEmail } from "@/lib/email";
import { getShopInfo } from "@/lib/data/shop";
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
    await sendInviteToStaff({ staffId: staff.id, name: fields.name, email: fields.email });
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function resendStaffInvite(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing staff id");

  const supabase = await createClient();
  const { data: staff } = await supabase.from("staff").select("name, email").eq("id", id).maybeSingle();
  if (!staff) throw new Error("Staff member not found");

  await sendInviteToStaff({ staffId: id, name: staff.name, email: staff.email });

  revalidatePath(`/admin/staff/${id}`);
  redirect(`/admin/staff/${id}?invited=1`);
}

async function sendInviteToStaff({
  staffId,
  name,
  email,
}: {
  staffId: string;
  name: string;
  email: string;
}) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: `${appUrl}/barber/accept-invite` },
  });

  if (linkError) throw linkError;

  // Link the Supabase auth user to the staff record (no-op if already set)
  if (linkData.user) {
    await supabase
      .from("staff")
      .update({ auth_user_id: linkData.user.id })
      .eq("id", staffId)
      .is("auth_user_id", null);
  }

  const shopInfo = await getShopInfo();
  await sendStaffInviteEmail({
    to: email,
    staffName: name,
    shopName: shopInfo.name,
    inviteLink: linkData.properties.action_link,
  });
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
