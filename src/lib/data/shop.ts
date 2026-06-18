import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MOCK_SERVICES, MOCK_STAFF, MOCK_STAFF_SERVICES } from "@/lib/data/mock-data";
import { DEFAULT_BOOKING_SETTINGS, DEFAULT_SHOP_INFO } from "@/lib/constants";
import type { BookingSettings, Service, ShopInfo, Staff, StaffService } from "@/types/database";

export async function getShopInfo(): Promise<ShopInfo> {
  if (!isSupabaseConfigured()) return DEFAULT_SHOP_INFO;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "shop_info")
      .maybeSingle();

    if (!data?.value) return DEFAULT_SHOP_INFO;
    return { ...DEFAULT_SHOP_INFO, ...(data.value as Partial<ShopInfo>) };
  } catch (error) {
    console.error("getShopInfo failed, using default shop info", error);
    return DEFAULT_SHOP_INFO;
  }
}

export async function getBookingSettings(): Promise<BookingSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_BOOKING_SETTINGS;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "booking")
      .maybeSingle();

    if (!data?.value) return DEFAULT_BOOKING_SETTINGS;
    return { ...DEFAULT_BOOKING_SETTINGS, ...(data.value as Partial<BookingSettings>) };
  } catch (error) {
    console.error("getBookingSettings failed, using default booking settings", error);
    return DEFAULT_BOOKING_SETTINGS;
  }
}

export async function getActiveServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return MOCK_SERVICES.filter((s) => s.active);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("getActiveServices failed, using mock services", error);
    return MOCK_SERVICES.filter((s) => s.active);
  }
}

export async function getActiveStaff(): Promise<Staff[]> {
  if (!isSupabaseConfigured()) return MOCK_STAFF.filter((s) => s.active);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("getActiveStaff failed, using mock staff", error);
    return MOCK_STAFF.filter((s) => s.active);
  }
}

export async function getStaffServiceMap(): Promise<StaffService[]> {
  if (!isSupabaseConfigured()) return MOCK_STAFF_SERVICES;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("staff_services").select("*");

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("getStaffServiceMap failed, using mock staff/service assignments", error);
    return MOCK_STAFF_SERVICES;
  }
}
