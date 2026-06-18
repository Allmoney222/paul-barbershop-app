import { createClient } from "@/lib/supabase/server";

export interface ClientSummary {
  email: string;
  name: string;
  phone: string;
  totalVisits: number;
  totalSpentCents: number;
  lastVisit: string | null;
}

export async function getClients(): Promise<ClientSummary[]> {
  try {
    const supabase = await createClient();

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("client_name, client_email, client_phone, service_id, status, start_time")
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
          totalSpentCents: isCancelled ? 0 : priceMap.get(appt.service_id) ?? 0,
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
    console.error("getClients failed, returning no clients", error);
    return [];
  }
}
