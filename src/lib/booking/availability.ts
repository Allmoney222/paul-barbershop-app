import { createClient } from "@/lib/supabase/server";
import { generateSlotsForStaff } from "@/lib/booking/slots";
import { zonedTimeToUtc } from "@/lib/timezone";
import { DEFAULT_BOOKING_SETTINGS, SHOP_TIMEZONE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MOCK_AVAILABILITY, MOCK_SERVICES, MOCK_STAFF, MOCK_STAFF_SERVICES } from "@/lib/data/mock-data";
import type { BookingSettings } from "@/types/database";

export interface SlotResult {
  time: string; // ISO UTC
  staffIds: string[];
}

interface GetAvailableSlotsParams {
  serviceId: string;
  staffId: string | "any";
  date: string; // "YYYY-MM-DD"
}

interface GetAvailableSlotsResult {
  slots: SlotResult[];
  durationMinutes: number;
}

/**
 * Computes available appointment start times for a given service on a
 * given date, either for one specific staff member or for "any"
 * eligible staff member. Falls back to mock data when Supabase isn't
 * configured (or errors), so the booking flow stays previewable.
 */
export async function getAvailableSlots(
  params: GetAvailableSlotsParams
): Promise<GetAvailableSlotsResult> {
  if (!isSupabaseConfigured()) {
    return getMockAvailableSlots(params);
  }

  try {
    return await getAvailableSlotsFromSupabase(params);
  } catch (error) {
    console.error("getAvailableSlots failed, falling back to mock availability", error);
    return getMockAvailableSlots(params);
  }
}

async function getAvailableSlotsFromSupabase(
  params: GetAvailableSlotsParams
): Promise<GetAvailableSlotsResult> {
  const { serviceId, staffId, date } = params;
  const supabase = await createClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, duration_minutes, active")
    .eq("id", serviceId)
    .maybeSingle();

  if (serviceError) throw serviceError;
  if (!service || !service.active) {
    return { slots: [], durationMinutes: 0 };
  }

  const settings = await getBookingSettingsInternal(supabase);

  let staffServiceQuery = supabase.from("staff_services").select("staff_id").eq("service_id", serviceId);
  if (staffId !== "any") {
    staffServiceQuery = staffServiceQuery.eq("staff_id", staffId);
  }
  const { data: staffServiceRows, error: staffServiceError } = await staffServiceQuery;
  if (staffServiceError) throw staffServiceError;

  const candidateStaffIds = (staffServiceRows ?? []).map((row) => row.staff_id);
  let staffIds: string[] = [];

  if (candidateStaffIds.length > 0) {
    const { data: activeStaff, error: activeStaffError } = await supabase
      .from("staff")
      .select("id")
      .eq("active", true)
      .in("id", candidateStaffIds);

    if (activeStaffError) throw activeStaffError;
    staffIds = (activeStaff ?? []).map((row) => row.id);
  }

  if (staffIds.length === 0) {
    return { slots: [], durationMinutes: service.duration_minutes };
  }

  const rangeStart = zonedTimeToUtc(date, "00:00:00", SHOP_TIMEZONE);
  const rangeEnd = zonedTimeToUtc(addDays(date, 1), "00:00:00", SHOP_TIMEZONE);
  const now = new Date();

  const slotMap = new Map<string, Set<string>>();

  for (const staff of staffIds) {
    const [{ data: availability, error: availError }, { data: blocked, error: blockedError }, { data: busy, error: busyError }] =
      await Promise.all([
        supabase.from("availability").select("day_of_week, start_time, end_time").eq("staff_id", staff),
        supabase.from("blocked_times").select("date, start_time, end_time").eq("date", date).or(`staff_id.eq.${staff},staff_id.is.null`),
        supabase.rpc("get_busy_intervals", {
          p_staff_id: staff,
          p_range_start: rangeStart.toISOString(),
          p_range_end: rangeEnd.toISOString(),
        }),
      ]);

    if (availError) throw availError;
    if (blockedError) throw blockedError;
    if (busyError) throw busyError;

    const slots = generateSlotsForStaff({
      date,
      timezone: SHOP_TIMEZONE,
      durationMinutes: service.duration_minutes,
      bufferMinutes: settings.buffer_minutes,
      slotIncrementMinutes: settings.slot_increment_minutes,
      availability: availability ?? [],
      blockedTimes: blocked ?? [],
      busyIntervals: busy ?? [],
      now,
    });

    for (const slot of slots) {
      const key = slot.toISOString();
      if (!slotMap.has(key)) slotMap.set(key, new Set());
      slotMap.get(key)!.add(staff);
    }
  }

  const result: SlotResult[] = Array.from(slotMap.entries())
    .map(([time, staffSet]) => ({ time, staffIds: Array.from(staffSet) }))
    .sort((a, b) => (a.time < b.time ? -1 : 1));

  return { slots: result, durationMinutes: service.duration_minutes };
}

/**
 * Mock slot generation used when Supabase isn't reachable. Uses the same
 * slot-generation logic against the bundled mock staff/services/hours,
 * with no blocked times or existing bookings to subtract.
 */
function getMockAvailableSlots(params: GetAvailableSlotsParams): GetAvailableSlotsResult {
  const { serviceId, staffId, date } = params;

  const service = MOCK_SERVICES.find((s) => s.id === serviceId);
  if (!service || !service.active) {
    return { slots: [], durationMinutes: 0 };
  }

  const candidateStaffIds = new Set(
    MOCK_STAFF_SERVICES.filter((ss) => ss.service_id === serviceId).map((ss) => ss.staff_id)
  );

  let staffIds = MOCK_STAFF.filter((s) => s.active && candidateStaffIds.has(s.id)).map((s) => s.id);
  if (staffId !== "any") {
    staffIds = staffIds.filter((id) => id === staffId);
  }

  if (staffIds.length === 0) {
    return { slots: [], durationMinutes: service.duration_minutes };
  }

  const now = new Date();
  const slotMap = new Map<string, Set<string>>();

  for (const staff of staffIds) {
    const slots = generateSlotsForStaff({
      date,
      timezone: SHOP_TIMEZONE,
      durationMinutes: service.duration_minutes,
      bufferMinutes: DEFAULT_BOOKING_SETTINGS.buffer_minutes,
      slotIncrementMinutes: DEFAULT_BOOKING_SETTINGS.slot_increment_minutes,
      availability: MOCK_AVAILABILITY[staff] ?? [],
      blockedTimes: [],
      busyIntervals: [],
      now,
    });

    for (const slot of slots) {
      const key = slot.toISOString();
      if (!slotMap.has(key)) slotMap.set(key, new Set());
      slotMap.get(key)!.add(staff);
    }
  }

  const result: SlotResult[] = Array.from(slotMap.entries())
    .map(([time, staffSet]) => ({ time, staffIds: Array.from(staffSet) }))
    .sort((a, b) => (a.time < b.time ? -1 : 1));

  return { slots: result, durationMinutes: service.duration_minutes };
}

async function getBookingSettingsInternal(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<BookingSettings> {
  const { data } = await supabase.from("settings").select("value").eq("key", "booking").maybeSingle();
  if (!data?.value) return DEFAULT_BOOKING_SETTINGS;
  return { ...DEFAULT_BOOKING_SETTINGS, ...(data.value as Partial<BookingSettings>) };
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
