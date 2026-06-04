import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrations = ["001_init.sql", "002_cms_tables.sql", "003_recreate_cms_tables.sql"];
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new pg.Pool({ connectionString });

try {
  for (const migration of migrations) {
    const sql = await readFile(join(root, "migrations", migration), "utf8");
    await pool.query(sql);
    console.log(`Applied ${migration}`);
  }
} finally {
  await pool.end();
}
