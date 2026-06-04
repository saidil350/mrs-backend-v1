/**
 * src/middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * CORS middleware untuk API routes.
 *
 * Menambahkan CORS headers pada semua respons dari /api/* routes.
 * Menangani OPTIONS preflight request dengan 204 No Content.
 *
 * Allowed origins dikonfigurasi via env var FRONTEND_URL (comma-separated).
 * Default: http://localhost:3000
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getAllowedOrigins(): Set<string> {
  const envValue = process.env.FRONTEND_URL || "http://localhost:3000";
  const origins = envValue
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return new Set(origins);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CRM-Lead-Secret, X-Revalidate-Secret",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400", // 24 jam preflight cache
};

export function middleware(request: NextRequest) {
  // Hanya proses API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin") || "";
  const allowedOrigins = getAllowedOrigins();
  const allowedOrigin = allowedOrigins.has(origin) ? origin : "";

  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (allowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    }
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // Handle request biasa — tambah CORS headers
  const response = NextResponse.next();
  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  }
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
