import { createClient } from "@/lib/supabase/server";
import { MOCK_SERVICES, MOCK_STAFF } from "@/lib/data/mock-data";
import type { Appointment, Service, Staff } from "@/types/database";

export interface AppointmentWithDetails extends Appointment {
  staff_name: string;
  service_name: string;
  service_duration_minutes: number;
  service_price_cents: number;
}

export async function getAllStaff(): Promise<Staff[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("getAllStaff failed, using mock staff", error);
    return MOCK_STAFF;
  }
}

export async function getAllServices(): Promise<Service[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("getAllServices failed, using mock services", error);
    return MOCK_SERVICES;
  }
}

/**
 * Fetches appointments with `start_time` in `[rangeStart, rangeEnd)`,
 * enriched with staff and service names via separate lookup queries
 * (the Database type has no embedded-relationship metadata, so joins
 * are resolved client-side).
 */
export async function getAppointmentsInRange(
  rangeStart: Date,
  rangeEnd: Date,
  opts: { staffId?: string; excludeCancelled?: boolean } = {}
): Promise<AppointmentWithDetails[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("appointments")
      .select("*")
      .gte("start_time", rangeStart.toISOString())
      .lt("start_time", rangeEnd.toISOString())
      .order("start_time", { ascending: true });

    if (opts.staffId) {
      query = query.eq("staff_id", opts.staffId);
    }
    if (opts.excludeCancelled) {
      query = query.neq("status", "cancelled");
    }

    const { data: appointments, error } = await query;
    if (error) throw error;
    if (!appointments || appointments.length === 0) return [];

    const staffIds = Array.from(new Set(appointments.map((a) => a.staff_id)));
    const serviceIds = Array.from(new Set(appointments.map((a) => a.service_id)));

    const [{ data: staffRows, error: staffError }, { data: serviceRows, error: serviceError }] =
      await Promise.all([
        supabase.from("staff").select("id, name").in("id", staffIds),
        supabase.from("services").select("id, name, duration_minutes, price_cents").in("id", serviceIds),
      ]);

    if (staffError) throw staffError;
    if (serviceError) throw serviceError;

    const staffMap = new Map((staffRows ?? []).map((s) => [s.id, s.name]));
    const serviceMap = new Map(
      (serviceRows ?? []).map((s) => [s.id, { name: s.name, duration: s.duration_minutes, price: s.price_cents }])
    );

    return appointments.map((appt) => ({
      ...appt,
      staff_name: staffMap.get(appt.staff_id) ?? "Unknown",
      service_name: serviceMap.get(appt.service_id)?.name ?? "Unknown",
      service_duration_minutes: serviceMap.get(appt.service_id)?.duration ?? 0,
      service_price_cents: serviceMap.get(appt.service_id)?.price ?? 0,
    }));
  } catch (error) {
    console.error("getAppointmentsInRange failed, returning no appointments", error);
    return [];
  }
}

export async function getAppointmentById(id: string): Promise<AppointmentWithDetails | null> {
  try {
    const supabase = await createClient();
    const { data: appt, error } = await supabase.from("appointments").select("*").eq("id", id).maybeSingle();

    if (error) throw error;
    if (!appt) return null;

    const [{ data: staffRow }, { data: serviceRow }] = await Promise.all([
      supabase.from("staff").select("name").eq("id", appt.staff_id).maybeSingle(),
      supabase.from("services").select("name, duration_minutes, price_cents").eq("id", appt.service_id).maybeSingle(),
    ]);

    return {
      ...appt,
      staff_name: staffRow?.name ?? "Unknown",
      service_name: serviceRow?.name ?? "Unknown",
      service_duration_minutes: serviceRow?.duration_minutes ?? 0,
      service_price_cents: serviceRow?.price_cents ?? 0,
    };
  } catch (error) {
    console.error("getAppointmentById failed", error);
    return null;
  }
}
