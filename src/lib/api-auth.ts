/**
 * src/lib/api-auth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Authentication helper untuk API Route Handlers.
 *
 * Berbeda dengan `getCurrentUser()` di session.ts yang menggunakan `cookies()`
 * dari next/headers (hanya bekerja di Server Actions / Server Components),
 * helper ini mengekstrak session token langsung dari header Cookie pada Request
 * object — sehingga cocok untuk API routes yang menerima request dari mana saja.
 *
 * Reuse: `parseSessionToken()` dari session.ts (pure function, no side effects).
 */

import { parseSessionToken } from "@/lib/session";
import type { CRMUser } from "@/types";

/**
 * Ekstrak value cookie berdasarkan nama dari header Cookie.
 */
function extractCookie(cookieHeader: string, name: string): string | undefined {
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return trimmed.slice(name.length + 1);
    }
  }
  return undefined;
}

/**
 * Autentikasi request berdasarkan session cookie.
 * Return CRMUser jika valid, atau null jika tidak terautentikasi.
 */
export function authenticateApiRequest(request: Request): CRMUser | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const sessionToken = extractCookie(cookieHeader, "mrs_crm_session");
  if (!sessionToken) return null;

  return parseSessionToken(sessionToken);
}
