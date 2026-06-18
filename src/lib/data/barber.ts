import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types/database";
import type { AppointmentWithDetails } from "@/lib/data/admin";
import type { ClientSummary } from "@/lib/data/clients";

export async function getBarberAppointmentsInRange(
  staffId: string,
  rangeStart: Date,
  rangeEnd: Date,
  opts: { excludeCancelled?: boolean } = {}
): Promise<AppointmentWithDetails[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("appointments")
      .select("*")
      .eq("staff_id", staffId)
      .gte("start_time", rangeStart.toISOString())
      .lt("start_time", rangeEnd.toISOString())
      .order("start_time", { ascending: true });

    if (opts.excludeCancelled) {
      query = query.neq("status", "cancelled");
    }

    const { data: appointments, error } = await query;
    if (error) throw error;
    if (!appointments || appointments.length === 0) return [];

    const serviceIds = Array.from(new Set(appointments.map((a) => a.service_id)));
    const [{ data: staffRow }, { data: serviceRows, error: serviceError }] = await Promise.all([
      supabase.from("staff").select("id, name").eq("id", staffId).maybeSingle(),
      supabase.from("services").select("id, name, duration_minutes, price_cents").in("id", serviceIds),
    ]);

    if (serviceError) throw serviceError;

    const staffName = staffRow?.name ?? "Unknown";
    const serviceMap = new Map(
      (serviceRows ?? []).map((s) => [
        s.id,
        { name: s.name, duration: s.duration_minutes, price: s.price_cents },
      ])
    );

    return appointments.map((appt) => ({
      ...appt,
      staff_name: staffName,
      service_name: serviceMap.get(appt.service_id)?.name ?? "Unknown",
      service_duration_minutes: serviceMap.get(appt.service_id)?.duration ?? 0,
      service_price_cents: serviceMap.get(appt.service_id)?.price ?? 0,
    }));
  } catch (error) {
    console.error("getBarberAppointmentsInRange failed", error);
    return [];
  }
}

export async function getBarberAppointmentById(
  staffId: string,
  id: string
): Promise<AppointmentWithDetails | null> {
  try {
    const supabase = await createClient();
    const { data: appt, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .eq("staff_id", staffId)
      .maybeSingle();

    if (error) throw error;
    if (!appt) return null;

    const [{ data: staffRow }, { data: serviceRow }] = await Promise.all([
      supabase.from("staff").select("name").eq("id", staffId).maybeSingle(),
      supabase
        .from("services")
        .select("name, duration_minutes, price_cents")
        .eq("id", appt.service_id)
        .maybeSingle(),
    ]);

    return {
      ...appt,
      staff_name: staffRow?.name ?? "Unknown",
      service_name: serviceRow?.name ?? "Unknown",
      service_duration_minutes: serviceRow?.duration_minutes ?? 0,
      service_price_cents: serviceRow?.price_cents ?? 0,
    };
  } catch (error) {
    console.error("getBarberAppointmentById failed", error);
    return null;
  }
}

export async function getBarberClients(staffId: string): Promise<ClientSummary[]> {
  try {
    const supabase = await createClient();

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("client_name, client_email, client_phone, service_id, status, start_time")
      .eq("staff_id", staffId)
      .order("start_time", { ascending: false });

    if (error) throw error;
    if (!appointments || appointments.length === 0) return [];

    const serviceIds = Array.from(new Set(appointments.map((a) => a.service_id)));
    const { data: services, error: serviceError } = await supabase
      .from("services")
      .select("id, price_cents")
      .in("id", serviceIds);

    if (serviceError) throw serviceError;
    const priceMap = new Map((services ?? []).map((s) => [s.id, s.price_cents]));

    const clients = new Map<string, ClientSummary>();

    for (const appt of appointments) {
      const existing = clients.get(appt.client_email);
      const isCancelled = appt.status === "cancelled";

      if (!existing) {
        clients.set(appt.client_email, {
          email: appt.client_email,
          name: appt.client_name,
          phone: appt.client_phone,
          totalVisits: isCancelled ? 0 : 1,
          totalSpentCents: isCancelled ? 0 : (priceMap.get(appt.service_id) ?? 0),
          lastVisit: appt.start_time,
        });
      } else {
        if (!isCancelled) {
          existing.totalVisits += 1;
          existing.totalSpentCents += priceMap.get(appt.service_id) ?? 0;
        }
        if (!existing.lastVisit || appt.start_time > existing.lastVisit) {
          existing.lastVisit = appt.start_time;
        }
      }
    }

    return Array.from(clients.values()).sort((a, b) => {
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return b.lastVisit < a.lastVisit ? -1 : 1;
    });
  } catch (error) {
    console.error("getBarberClients failed", error);
    return [];
  }
}

export interface BarberService extends Service {
  offered: boolean;
}

export async function getBarberServices(staffId: string): Promise<BarberService[]> {
  try {
    const supabase = await createClient();

    const [{ data: allServices, error: servicesError }, { data: staffServices, error: ssError }] =
      await Promise.all([
        supabase.from("services").select("*").eq("active", true).order("sort_order", { ascending: true }),
        supabase.from("staff_services").select("service_id").eq("staff_id", staffId),
      ]);

    if (servicesError) throw servicesError;
    if (ssError) throw ssError;

    const offeredIds = new Set((staffServices ?? []).map((r) => r.service_id));

    return (allServices ?? []).map((s) => ({ ...s, offered: offeredIds.has(s.id) }));
  } catch (error) {
    console.error("getBarberServices failed", error);
    return [];
  }
}
