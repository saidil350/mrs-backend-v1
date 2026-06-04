import type { LeadStatus } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{8,15}$/;

export type LeadInput = {
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  message: string;
  sourcePage: string | null;
  sourceUrl: string | null;
};

export function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizePhone(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+62")) return `+62${digits.slice(3).replace(/^0+/, "")}`;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("+")) return digits;
  return digits;
}

export function isValidLeadStatus(value: string): value is LeadStatus {
  return ["new", "contacted", "proposal_sent", "won", "lost", "rejected"].includes(value);
}

export function hasHoneypot(body: Record<string, unknown>) {
  return Boolean(clean(body.website) || clean(body.companyWebsite) || clean(body.url));
}

export function validateLeadPayload(body: Record<string, unknown>) {
  const name = clean(body.name);
  const phone = normalizePhone(clean(body.phone));
  const email = clean(body.email);
  const company = clean(body.company);
  const message = clean(body.message) || clean(body.need);
  const sourcePage = clean(body.sourcePage);
  const sourceUrl = clean(body.sourceUrl);
  const errors: string[] = [];

  if (!name) errors.push("Nama wajib diisi.");
  if (!phone) errors.push("Nomor WhatsApp wajib diisi.");
  if (phone && !PHONE_RE.test(phone)) errors.push("Format nomor WhatsApp tidak valid.");
  if (!message) errors.push("Pesan atau kebutuhan wajib diisi.");
  if (email && !EMAIL_RE.test(email)) errors.push("Format email tidak valid.");

  return {
    ok: errors.length === 0,
    errors,
    data: {
      name,
      phone,
      email: email || null,
      company: company || null,
      message,
      sourcePage: sourcePage || null,
      sourceUrl: sourceUrl || null,
    } satisfies LeadInput,
  };
}
