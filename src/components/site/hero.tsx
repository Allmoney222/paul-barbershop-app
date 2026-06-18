import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoldDivider } from "@/components/site/gold-divider";
import type { ShopInfo } from "@/types/database";

export function Hero({ shop }: { shop: ShopInfo }) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(201,169,110,0.18), transparent 70%)",
        }}
      />
      <div className="container mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#C9A96E]">
          Buffalo, NY
        </p>
        <h1 className="mt-6 font-display text-5xl leading-tight text-[#F5F5F5] sm:text-7xl">
          <span className="italic text-[#C9A96E]">2Gether</span> Hair Studio
        </h1>
        <GoldDivider className="my-8 max-w-xs" />
        <p className="max-w-xl text-lg text-[#888888] sm:text-xl">{shop.tagline}</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90"
          >
            <Link href="/book">Book Now</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-[#C9A96E]/40 bg-transparent text-[#F5F5F5] hover:bg-[#C9A96E]/10 hover:text-[#F5F5F5]"
          >
            <Link href="#services">View Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
