import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Service-role client for trusted server-side operations only
// (API routes, webhooks, server actions that need to bypass RLS).
// NEVER import this from a Client Component.
function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

export function createAdminClient() {
  return createSupabaseClient<Database>(
    stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY!),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
