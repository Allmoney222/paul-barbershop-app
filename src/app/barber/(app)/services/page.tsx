import { GoldDivider } from "@/components/site/gold-divider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireBarberStaff } from "@/lib/supabase/barber-auth";
import { getBarberServices } from "@/lib/data/barber";
import { toggleBarberService } from "@/lib/actions/barber-services";
import { formatPrice, formatDuration } from "@/lib/format";

export default async function BarberServicesPage() {
  const currentStaff = await requireBarberStaff();
  const services = await getBarberServices(currentStaff.id);

  const offered = services.filter((s) => s.offered);
  const available = services.filter((s) => !s.offered);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">My Services</h1>
      <p className="mt-1 text-sm text-[#888888]">
        Toggle which services you offer. Contact the owner to add or edit service details.
      </p>

      <GoldDivider className="my-6" />

      <section>
        <h2 className="font-display text-lg text-[#F5F5F5]">
          Currently Offering{" "}
          <span className="ml-2 text-sm font-normal text-[#888888]">({offered.length})</span>
        </h2>

        <div className="mt-3 space-y-2">
          {offered.length === 0 ? (
            <p className="text-sm text-[#888888]">You are not offering any services yet.</p>
          ) : (
            offered.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[#F5F5F5]">{service.name}</p>
                    <Badge variant="outline" className="border-[#C9A96E]/30 bg-[#C9A96E]/10 text-[#C9A96E] text-xs">
                      {service.category}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-[#888888]">
                    {formatDuration(service.duration_minutes)} &middot; {formatPrice(service.price_cents)}
                  </p>
                  {service.description && (
                    <p className="mt-1 text-xs text-[#888888] line-clamp-1">{service.description}</p>
                  )}
                </div>
                <form action={toggleBarberService} className="shrink-0">
                  <input type="hidden" name="service_id" value={service.id} />
                  <input type="hidden" name="offered" value="true" />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    Remove
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>

      {available.length > 0 && (
        <>
          <GoldDivider className="my-6" />

          <section>
            <h2 className="font-display text-lg text-[#F5F5F5]">
              Available to Add{" "}
              <span className="ml-2 text-sm font-normal text-[#888888]">({available.length})</span>
            </h2>

            <div className="mt-3 space-y-2">
              {available.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-4 opacity-70"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[#F5F5F5]">{service.name}</p>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-[#888888] text-xs">
                        {service.category}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-[#888888]">
                      {formatDuration(service.duration_minutes)} &middot; {formatPrice(service.price_cents)}
                    </p>
                  </div>
                  <form action={toggleBarberService} className="shrink-0">
                    <input type="hidden" name="service_id" value={service.id} />
                    <input type="hidden" name="offered" value="false" />
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90"
                    >
                      Add
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
