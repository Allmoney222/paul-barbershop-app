"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signInWithPassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(`/admin/login?error=${encodeURIComponent("Supabase is not configured yet.")}`);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("signInWithPassword failed", error);
    redirect(`/admin/login?error=${encodeURIComponent("Unable to reach the authentication service.")}`);
  }

  redirect("/admin/dashboard");
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("signOut failed", error);
  }

  redirect("/admin/login");
}

/** `redirect()` throws a special error that Next.js uses to perform the redirect — don't swallow it. */
function isRedirectError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT");
}
