"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DAY_LABELS_SHORT } from "@/lib/constants";
import type { ShopInfo } from "@/types/database";

const HOUR_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export async function updateShopInfo(formData: FormData) {
  const hours: ShopInfo["hours"] = {};
  HOUR_KEYS.forEach((key, i) => {
    hours[key] = String(formData.get(`hours_${DAY_LABELS_SHORT[i].toLowerCase()}`) ?? "");
  });

  const value: ShopInfo = {
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    timezone: String(formData.get("timezone") ?? "America/New_York"),
    hours,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("settings").upsert({ key: "shop_info", value });

  if (error) throw error;

  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function updateBookingSettings(formData: FormData) {
  const value = {
    deposit_enabled: formData.get("deposit_enabled") === "on",
    deposit_amount_cents: Math.round(Number(formData.get("deposit_amount") ?? 0) * 100),
    buffer_minutes: Number(formData.get("buffer_minutes") ?? 0),
    slot_increment_minutes: Number(formData.get("slot_increment_minutes") ?? 15),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("settings").upsert({ key: "booking", value });

  if (error) throw error;

  revalidatePath("/admin/settings");
  revalidatePath("/book");
}
