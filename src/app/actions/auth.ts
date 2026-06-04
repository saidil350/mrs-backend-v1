"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import type { CRMUser } from "@/types";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const result = await getDb().query(
    "SELECT id, name, email, role, password_hash, password_salt FROM crm_users WHERE lower(email) = $1",
    [email],
  );
  const row = result.rows[0];

  if (!row || !verifyPassword(password, row.password_hash, row.password_salt)) {
    redirect("/login?error=invalid");
  }

  await setSessionCookie({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  } satisfies CRMUser);

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
