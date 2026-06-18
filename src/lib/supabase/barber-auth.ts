"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Staff } from "@/types/database";

export async function requireBarberStaff(): Promise<Staff> {
  if (!isSupabaseConfigured()) {
    redirect("/barber/login");
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      redirect("/barber/login");
    }

    const { data: staff } = await supabase
      .from("staff")
      .select("*")
      .eq("auth_user_id", userData.user.id)
      .maybeSingle();

    if (!staff) {
      redirect("/barber/login");
    }

    return staff;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("requireBarberStaff failed, redirecting to login", error);
    redirect("/barber/login");
  }
}

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}
