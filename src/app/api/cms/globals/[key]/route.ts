import { NextResponse } from "next/server";
import { getGlobal, updateGlobal, GLOBALS_REGISTRY } from "@/lib/cms/globals";
import { authenticateApiRequest } from "@/lib/api-auth";
import { isRateLimitedApi } from "@/lib/rate-limit";

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ─── GET — Public read ────────────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  const meta = GLOBALS_REGISTRY.find((g) => g.key === key);
  if (!meta) {
    return NextResponse.json({ error: "Global not found" }, { status: 404 });
  }

  const g = await getGlobal(key);
  if (!g) {
    return NextResponse.json({ error: "Global not found" }, { status: 404 });
  }

  return NextResponse.json(g.data);
}

// ─── PUT — Update global (authenticated) ──────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  // Auth check
  const user = authenticateApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const ip = getClientIp(request);
  if (isRateLimitedApi(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak request. Coba lagi nanti." },
      { status: 429 }
    );
  }

  const { key } = await params;

  // Validate key
  const meta = GLOBALS_REGISTRY.find((g) => g.key === key);
  if (!meta) {
    return NextResponse.json({ error: "Global not found" }, { status: 404 });
  }

  // Parse body
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return NextResponse.json(
      { error: "Body must be a JSON object" },
      { status: 400 }
    );
  }

  // Upsert: ensure row exists, then update
  const existing = await getGlobal(key);
  if (!existing) {
    return NextResponse.json(
      { error: "Global row not found in database. Run seed script first." },
      { status: 404 }
    );
  }

  const updated = await updateGlobal(key, data);
  if (!updated) {
    return NextResponse.json(
      { error: "Failed to update global" },
      { status: 500 }
    );
  }

  // Trigger frontend revalidation so landing page picks up changes immediately
  try {
    const frontendUrl = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3000";
    const revalidateSecret = process.env.REVALIDATE_SECRET || "";
    await fetch(`${frontendUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(revalidateSecret ? { Authorization: `Bearer ${revalidateSecret}` } : {}),
      },
      body: JSON.stringify({ paths: ["/"], source: `cms-global-${key}` }),
    }).catch(() => {});
  } catch {}

  return NextResponse.json({
    key: updated.key,
    data: updated.data,
    updatedAt: updated.updatedAt,
  });
}

// ─── POST — Alias for PUT (some clients prefer POST) ──────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  return PUT(request, { params });
}
