import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { CRMUser } from "@/types";

const COOKIE_NAME = "mrs_crm_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = CRMUser & {
  exp: number;
};

function getSecret() {
  const secret = process.env.CRM_SESSION_SECRET;
  if (!secret) {
    throw new Error("CRM_SESSION_SECRET is required");
  }
  return secret;
}

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessionToken(user: CRMUser) {
  const payload = base64url(
    JSON.stringify({
      ...user,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    } satisfies SessionPayload),
  );
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token?: string): CRMUser | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: CRMUser) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const store = await cookies();
  return parseSessionToken(store.get(COOKIE_NAME)?.value);
}
