"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1));
    const type = params.get("type");
    const accessToken = params.get("access_token");

    if (accessToken && (type === "recovery" || type === "invite") && pathname !== "/barber/accept-invite") {
      router.replace(`/barber/accept-invite${hash}`);
    }
  }, [pathname, router]);

  return null;
}
