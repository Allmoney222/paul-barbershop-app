import { SiteHeader } from "@/components/site/site-header";
import { BookingFlow } from "@/components/booking/booking-flow";
import {
  getActiveServices,
  getActiveStaff,
  getStaffServiceMap,
  getBookingSettings,
} from "@/lib/data/shop";

export default async function BookPage() {
  const [services, staff, staffServices, bookingSettings] = await Promise.all([
    getActiveServices(),
    getActiveStaff(),
    getStaffServiceMap(),
    getBookingSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <BookingFlow
          services={services}
          staff={staff}
          staffServices={staffServices}
          bookingSettings={bookingSettings}
        />
      </main>
    </div>
  );
}
