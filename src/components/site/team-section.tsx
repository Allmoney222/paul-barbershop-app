import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoldDivider } from "@/components/site/gold-divider";
import type { Staff } from "@/types/database";

export function TeamSection({ staff }: { staff: Staff[] }) {
  return (
    <section id="team" className="border-b border-white/5 bg-[#0D0D0D]">
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl text-[#F5F5F5] sm:text-5xl">
            Meet the <span className="italic text-[#C9A96E]">Team</span>
          </h2>
          <GoldDivider className="mx-auto my-6 max-w-xs" />
          <p className="mx-auto max-w-xl text-[#888888]">
            A team of stylists and barbers united by craft and community.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id} className="overflow-hidden border-white/5 bg-[#1A1A1A]">
              <div className="relative h-72 w-full bg-[#1A1A1A]">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-6xl italic text-[#C9A96E]/40">
                    {member.name[0]}
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="font-display text-2xl text-[#F5F5F5]">{member.name}</h3>
                <p className="mt-1 text-sm uppercase tracking-widest text-[#C9A96E]">
                  {roleLabel(member.role)}
                </p>
                {member.bio && (
                  <p className="mt-3 text-sm text-[#888888]">{member.bio}</p>
                )}
                {member.specialties.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.specialties.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="border-none bg-white/5 text-xs text-[#F5F5F5]"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function roleLabel(role: Staff["role"]) {
  switch (role) {
    case "admin":
      return "Owner";
    case "barber":
      return "Barber";
    case "stylist":
      return "Stylist";
    default:
      return role;
  }
}
