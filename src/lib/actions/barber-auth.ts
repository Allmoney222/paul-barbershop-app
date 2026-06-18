"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signInAsBarber(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(`/barber/login?error=${encodeURIComponent("Supabase is not configured yet.")}`);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(`/barber/login?error=${encodeURIComponent(error.message)}`);
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("signInAsBarber failed", error);
    redirect(`/barber/login?error=${encodeURIComponent("Unable to reach the authentication service.")}`);
  }

  redirect("/barber/dashboard");
}

export async function signOutBarber() {
  if (!isSupabaseConfigured()) {
    redirect("/barber/login");
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("signOutBarber failed", error);
  }

  redirect("/barber/login");
}

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}
