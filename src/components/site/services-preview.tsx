import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoldDivider } from "@/components/site/gold-divider";
import { formatDuration, formatPrice } from "@/lib/format";
import type { Service } from "@/types/database";

export function ServicesPreview({ services }: { services: Service[] }) {
  return (
    <section id="services" className="border-b border-white/5 bg-[#0D0D0D]">
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl text-[#F5F5F5] sm:text-5xl">
            Our <span className="italic text-[#C9A96E]">Services</span>
          </h2>
          <GoldDivider className="mx-auto my-6 max-w-xs" />
          <p className="mx-auto max-w-xl text-[#888888]">
            From precision fades to vibrant color, our team brings expertise and
            care to every chair.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className="relative overflow-hidden border-white/5 transition-colors hover:border-[#C9A96E]/40"
            >
              {/* Background photo + dark overlay */}
              {service.photo_url ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${service.photo_url}')` }}
                  />
                  <div className="absolute inset-0 bg-black/65" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[#1A1A1A]" />
              )}

              {/* Content sits above the background */}
              <div className="relative">
                <CardHeader>
                  <Badge
                    variant="secondary"
                    className="w-fit border-none bg-[#C9A96E]/10 text-[#C9A96E]"
                  >
                    {service.category}
                  </Badge>
                  <CardTitle className="font-display text-xl text-[#F5F5F5]">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {service.description && (
                    <p className="mb-3 text-sm text-[#CCCCCC] line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#C9A96E] font-semibold">
                      {formatPrice(service.price_cents)}
                    </span>
                    <span className="text-[#AAAAAA]">
                      {formatDuration(service.duration_minutes)}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/book"
            className="font-display text-lg italic text-[#C9A96E] underline-offset-4 hover:underline"
          >
            Book your appointment &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
