import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") || 100), 200);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

  const db = getDb();

  // Single project by slug
  if (slug) {
    const result = await db.query(
      "SELECT * FROM projects WHERE slug = $1 AND is_published = true",
      [slug]
    );
    const project = result.rows[0] ?? null;
    return NextResponse.json(project);
  }

  // List with optional filters
  let sql = "SELECT * FROM projects WHERE is_published = true";
  const params: unknown[] = [];
  let idx = 1;

  if (category) {
    sql += ` AND category = $${idx++}`;
    params.push(category);
  }

  sql += " ORDER BY sort_order, created_at DESC";
  sql += ` LIMIT $${idx++} OFFSET $${idx}`;
  params.push(limit, offset);

  const result = await db.query(sql, params);
  return NextResponse.json(result.rows);
}
