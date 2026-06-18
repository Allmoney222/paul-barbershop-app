"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  Scissors,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import type { StaffRole } from "@/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/clients", label: "Clients", icon: Users, adminOnly: true },
  { href: "/admin/staff", label: "Staff", icon: UserCog, adminOnly: true },
  { href: "/admin/services", label: "Services", icon: Scissors, adminOnly: true },
  { href: "/admin/availability", label: "Availability", icon: Clock },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function AdminSidebarNav({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
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
        <form action={signOut}>
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
