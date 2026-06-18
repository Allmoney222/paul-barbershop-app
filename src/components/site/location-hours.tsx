import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { GoldDivider } from "@/components/site/gold-divider";
import { DAY_LABELS_SHORT } from "@/lib/constants";
import type { ShopInfo } from "@/types/database";

const HOUR_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function LocationHours({ shop }: { shop: ShopInfo }) {
  return (
    <section id="location" className="bg-[#0D0D0D]">
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl text-[#F5F5F5] sm:text-5xl">
            Visit <span className="italic text-[#C9A96E]">Us</span>
          </h2>
          <GoldDivider className="mx-auto my-6 max-w-xs" />
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div className="space-y-5 text-[#F5F5F5]">
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 h-5 w-5 text-[#C9A96E]" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-[#888888]">{shop.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="mt-1 h-5 w-5 text-[#C9A96E]" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-[#888888]">{shop.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="mt-1 h-5 w-5 text-[#C9A96E]" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-[#888888]">{shop.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
            <div className="mb-4 flex items-center gap-3 text-[#F5F5F5]">
              <Clock className="h-5 w-5 text-[#C9A96E]" />
              <p className="font-medium">Hours</p>
            </div>
            <ul className="space-y-2 text-sm">
              {HOUR_KEYS.map((key, i) => (
                <li key={key} className="flex items-center justify-between border-b border-white/5 py-1.5 last:border-none">
                  <span className="text-[#888888]">{DAY_LABELS_SHORT[(i + 1) % 7]}</span>
                  <span className="text-[#F5F5F5]">{shop.hours[key] ?? "Closed"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
