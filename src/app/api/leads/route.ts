import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import { notifyNewLead } from "@/lib/notifications";
import { isRateLimited } from "@/lib/rate-limit";
import { hasHoneypot, validateLeadPayload } from "@/lib/validation";

export const runtime = "nodejs";

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isAuthorized(request: Request) {
  const secret = process.env.PUBLIC_LEAD_SECRET;
  if (!secret) return true;

  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-crm-lead-secret");
  return authorization === `Bearer ${secret}` || headerSecret === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, message: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (hasHoneypot(body)) {
    return NextResponse.json({ ok: false, message: "Spam check failed." }, { status: 400 });
  }

  const validation = validateLeadPayload(body);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400 });
  }

  const lead = await createLead(validation.data);
  await notifyNewLead(lead);

  return NextResponse.json(
    {
      ok: true,
      data: {
        id: lead.id,
        status: lead.status,
      },
    },
    { status: 201 },
  );
}
