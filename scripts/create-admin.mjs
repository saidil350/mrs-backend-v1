import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const [, , nameArg, emailArg, passwordArg, roleArg] = process.argv;
const name = nameArg || process.env.CRM_ADMIN_NAME || "Admin MRS";
const email = (emailArg || process.env.CRM_ADMIN_EMAIL || "").toLowerCase();
const password = passwordArg || process.env.CRM_ADMIN_PASSWORD || "";
const role = roleArg || process.env.CRM_ADMIN_ROLE || "admin";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!email || !password) throw new Error("Pass name/email/password args or set CRM_ADMIN_EMAIL and CRM_ADMIN_PASSWORD");
if (!["admin", "sales"].includes(role)) throw new Error("Role must be admin or sales");

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query(
    `INSERT INTO crm_users (name, email, role, password_hash, password_salt)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET
       name = excluded.name,
       role = excluded.role,
       password_hash = excluded.password_hash,
       password_salt = excluded.password_salt,
       updated_at = now()`,
    [name, email, role, hash, salt],
  );
  console.log(`User ready: ${email} (${role})`);
} finally {
  await pool.end();
}
