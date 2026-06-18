import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Staff } from "@/types/database";

/**
 * Returns the staff row linked to the current session. Redirects to the
 * admin login page if there is no session, no matching staff record, or
 * Supabase isn't configured/reachable.
 */
export async function requireStaff(): Promise<Staff> {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      redirect("/admin/login");
    }

    const { data: staff } = await supabase
      .from("staff")
      .select("*")
      .eq("auth_user_id", userData.user.id)
      .maybeSingle();

    if (!staff) {
      redirect("/admin/login");
    }

    return staff;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("requireStaff failed, redirecting to login", error);
    redirect("/admin/login");
  }
}

/** `redirect()` throws a special error that Next.js uses to perform the redirect — don't swallow it. */
function isRedirectError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT");
}

/** Returns the staff row for the current session, redirecting non-admins to the dashboard. */
export async function requireAdmin(): Promise<Staff> {
  const staff = await requireStaff();
  if (staff.role !== "admin") {
    redirect("/admin/dashboard");
  }
  return staff;
}
