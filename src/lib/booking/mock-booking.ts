import type { AppointmentByTokenResult } from "@/types/database";

// In preview mode (no Supabase configured) we can't persist a created
// appointment, so we encode it into the "cancel token" itself. The
// confirmation page can decode it back without touching the database.

const MOCK_TOKEN_PREFIX = "mock_";

export function isMockCancelToken(token: string): boolean {
  return token.startsWith(MOCK_TOKEN_PREFIX);
}

export function createMockCancelToken(appointment: AppointmentByTokenResult): string {
  const json = JSON.stringify(appointment);
  const encoded = Buffer.from(json, "utf-8").toString("base64url");
  return `${MOCK_TOKEN_PREFIX}${encoded}`;
}

export function decodeMockCancelToken(token: string): AppointmentByTokenResult | null {
  if (!isMockCancelToken(token)) return null;

  try {
    const json = Buffer.from(token.slice(MOCK_TOKEN_PREFIX.length), "base64url").toString("utf-8");
    return JSON.parse(json) as AppointmentByTokenResult;
  } catch {
    return null;
  }
}
