const PLACEHOLDER_PATTERNS = ["placeholder", "your-project", "your-anon-key", "your-service-key"];

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function looksLikePlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => lower.includes(pattern));
}

/** True if NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set to real values. */
export function isSupabaseConfigured(): boolean {
  const url = stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  const anonKey = stripBom(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");

  if (!url || !anonKey) return false;
  if (looksLikePlaceholder(url) || looksLikePlaceholder(anonKey)) return false;

  return true;
}

/** True if the service-role key needed for admin operations (invites, bookings) is set to a real value. */
export function isSupabaseAdminConfigured(): boolean {
  const serviceKey = stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY ?? "");
  if (!serviceKey || looksLikePlaceholder(serviceKey)) return false;
  return isSupabaseConfigured();
}
