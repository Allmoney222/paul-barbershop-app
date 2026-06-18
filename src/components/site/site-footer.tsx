import Link from "next/link";
import { GoldDivider } from "@/components/site/gold-divider";
import { DEFAULT_SHOP_INFO } from "@/lib/constants";

export function SiteFooter() {
  const shop = DEFAULT_SHOP_INFO;

  return (
    <footer className="bg-[#0D0D0D]">
      <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <GoldDivider className="mb-10" />
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-display text-lg italic text-[#C9A96E]">2Gether Hair Studio</h3>
            <p className="mt-2 max-w-xs text-sm text-[#888888]">{shop.tagline}</p>
          </div>
          <div className="text-sm text-[#888888]">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#F5F5F5]">
              Visit Us
            </h4>
            <p>{shop.address}</p>
            <p className="mt-1">{shop.phone}</p>
            <p className="mt-1">{shop.email}</p>
          </div>
          <div className="text-sm text-[#888888]">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#F5F5F5]">
              Quick Links
            </h4>
            <ul className="space-y-1">
              <li>
                <Link href="/book" className="transition-colors hover:text-[#C9A96E]">
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link href="/#services" className="transition-colors hover:text-[#C9A96E]">
                  Services &amp; Pricing
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="transition-colors hover:text-[#C9A96E]">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-[#888888]">
          &copy; {new Date().getFullYear()} 2Gether Hair Studio · Buffalo, NY
        </p>
      </div>
    </footer>
  );
}
