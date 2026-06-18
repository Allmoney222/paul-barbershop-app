import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-xl tracking-wide text-[#F5F5F5]">
          <span className="italic text-[#C9A96E]">2Gether</span>{" "}
          <span className="font-sans text-sm font-medium uppercase tracking-[0.2em] text-[#888888]">
            Hair Studio
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#F5F5F5]/80 sm:flex">
          <Link href="/#services" className="transition-colors hover:text-[#C9A96E]">
            Services
          </Link>
          <Link href="/#team" className="transition-colors hover:text-[#C9A96E]">
            Our Team
          </Link>
          <Link href="/#location" className="transition-colors hover:text-[#C9A96E]">
            Location &amp; Hours
          </Link>
        </nav>
        <Button
          asChild
          className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90"
        >
          <Link href="/book">Book Now</Link>
        </Button>
      </div>
    </header>
  );
}
