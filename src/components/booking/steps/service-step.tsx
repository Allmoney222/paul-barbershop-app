"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatServicePrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/database";

export function ServiceStep({
  services,
  selectedServiceId,
  onSelect,
}: {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (service: Service) => void;
}) {
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div>
      <h2 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Choose a Service</h2>
      <p className="mt-1 text-sm text-[#888888]">
        Select the service you&apos;d like to book.
      </p>

      <div className="mt-6 space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#C9A96E]">
              {category}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {services
                .filter((s) => s.category === category)
                .map((service) => (
                  <Card
                    key={service.id}
                    onClick={() => onSelect(service)}
                    className={cn(
                      "cursor-pointer border-white/5 bg-[#1A1A1A] p-4 transition-colors hover:border-[#C9A96E]/50",
                      selectedServiceId === service.id && "border-[#C9A96E] ring-1 ring-[#C9A96E]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#F5F5F5]">{service.name}</p>
                        {service.description && (
                          <p className="mt-1 text-xs text-[#888888]">{service.description}</p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 border-none bg-[#C9A96E]/10 text-[#C9A96E]"
                      >
                        {formatServicePrice(service.price_cents, service.price_is_starting_at)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-[#888888]">
                      {formatDuration(service.duration_minutes)}
                    </p>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
