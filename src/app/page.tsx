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
    <div className="relative min-h-screen">
      {/* Fixed parallax background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat md:bg-top"
        style={{ backgroundImage: "url('https://i.imgur.com/wTR5VqK.png')" }}
        aria-hidden="true"
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-black/50" aria-hidden="true" />
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
