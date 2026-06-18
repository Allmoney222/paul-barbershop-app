import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Hero } from "@/components/site/hero";
import { ServicesPreview } from "@/components/site/services-preview";
import { TeamSection } from "@/components/site/team-section";
import { LocationHours } from "@/components/site/location-hours";
import { getActiveServices, getActiveStaff, getShopInfo } from "@/lib/data/shop";

export const revalidate = 60;

export default async function Home() {
  const [shop, services, staff] = await Promise.all([
    getShopInfo(),
    getActiveServices(),
    getActiveStaff(),
  ]);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <SiteHeader />
      <main>
        <Hero shop={shop} />
        <ServicesPreview services={services} />
        <TeamSection staff={staff} />
        <LocationHours shop={shop} />
      </main>
      <SiteFooter />
    </div>
  );
}
