import Link from "next/link";
import { Menu } from "lucide-react";
import { requireBarberStaff } from "@/lib/supabase/barber-auth";
import { BarberSidebarNav } from "@/components/barber/barber-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const ROLE_LABELS: Record<string, string> = {
  admin: "Owner",
  barber: "Barber",
  stylist: "Stylist",
};

export default async function BarberAppLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireBarberStaff();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5]">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 flex-col border-r border-white/5 bg-[#1A1A1A] lg:flex">
          <SidebarHeader staffName={staff.name} role={staff.role} />
          <BarberSidebarNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-white/5 bg-[#1A1A1A] px-4 py-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#F5F5F5] hover:bg-white/5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 border-white/5 bg-[#1A1A1A] p-0 text-[#F5F5F5]">
                <SidebarHeader staffName={staff.name} role={staff.role} />
                <BarberSidebarNav />
              </SheetContent>
            </Sheet>
            <span className="font-display text-lg">
              <span className="italic text-[#C9A96E]">2Gether</span> Portal
            </span>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SidebarHeader({ staffName, role }: { staffName: string; role: string }) {
  return (
    <div className="border-b border-white/5 p-4">
      <Link href="/barber/dashboard" className="font-display text-xl text-[#F5F5F5]">
        <span className="italic text-[#C9A96E]">2Gether</span> Portal
      </Link>
      <p className="mt-1 text-xs text-[#888888]">
        {staffName} &middot; {ROLE_LABELS[role] ?? role}
      </p>
    </div>
  );
}
