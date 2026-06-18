"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Clock,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutBarber } from "@/lib/actions/barber-auth";

const NAV_ITEMS = [
  { href: "/barber/dashboard", label: "My Schedule", icon: LayoutDashboard },
  { href: "/barber/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/barber/clients", label: "My Clients", icon: Users },
  { href: "/barber/services", label: "My Services", icon: Scissors },
  { href: "/barber/availability", label: "Availability", icon: Clock },
];

export function BarberSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-[#C9A96E]/10 text-[#C9A96E]"
                : "text-[#888888] hover:bg-white/5 hover:text-[#F5F5F5]"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto pt-4">
        <form action={signOutBarber}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#888888] transition-colors hover:bg-white/5 hover:text-[#F5F5F5]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </nav>
  );
}
