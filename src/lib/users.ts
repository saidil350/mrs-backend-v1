import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import type { CRMUser, UserRole } from "@/types";

export type UserRecord = CRMUser & {
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: row.role as UserRole,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const result = await getDb().query(
    "SELECT id, name, email, role, created_at, updated_at FROM crm_users ORDER BY created_at DESC",
  );
  return result.rows.map(mapRow);
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const result = await getDb().query(
    "SELECT id, name, email, role, created_at, updated_at FROM crm_users WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await getDb().query(
    "SELECT id, name, email, role, created_at, updated_at FROM crm_users WHERE lower(email) = lower($1)",
    [email],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function countUsers(): Promise<number> {
  const result = await getDb().query(
    "SELECT count(*)::int AS cnt FROM crm_users",
  );
  return result.rows[0]?.cnt ?? 0;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<UserRecord> {
  const email = data.email.trim().toLowerCase();
  const { hash, salt } = hashPassword(data.password);

  const result = await getDb().query(
    `INSERT INTO crm_users (name, email, role, password_hash, password_salt)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, created_at, updated_at`,
    [data.name.trim(), email, data.role, hash, salt],
  );
  return mapRow(result.rows[0]);
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: UserRole;
    password?: string;
  },
): Promise<UserRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name.trim());
  }
  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email.trim().toLowerCase());
  }
  if (data.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(data.role);
  }
  if (data.password) {
    const { hash, salt } = hashPassword(data.password);
    fields.push(`password_hash = $${idx++}`);
    values.push(hash);
    fields.push(`password_salt = $${idx++}`);
    values.push(salt);
  }

  if (fields.length === 0) return getUserById(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const result = await getDb().query(
    `UPDATE crm_users SET ${fields.join(", ")} WHERE id = $${idx}
     RETURNING id, name, email, role, created_at, updated_at`,
    values,
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function deleteUser(id: string): Promise<string | null> {
  const result = await getDb().query(
    "DELETE FROM crm_users WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rows[0]?.id ?? null;
}
