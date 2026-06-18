import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/booking/availability";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId") ?? "any";
  const date = searchParams.get("date");

  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "serviceId and date (YYYY-MM-DD) are required" },
      { status: 400 }
    );
  }

  try {
    const { slots, durationMinutes } = await getAvailableSlots({ serviceId, staffId, date });
    return NextResponse.json({
      date,
      durationMinutes,
      slots: slots.map((s) => ({ time: s.time, staffIds: s.staffIds })),
    });
  } catch (error) {
    console.error("availability error", error);
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }
}
