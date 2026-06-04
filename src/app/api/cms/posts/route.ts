import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");

  const db = getDb();

  if (slug) {
    const result = await db.query(
      "SELECT * FROM posts WHERE slug = $1 AND is_published = true",
      [slug],
    );
    const post = result.rows[0] ?? null;
    return NextResponse.json(post);
  }

  let sql = "SELECT * FROM posts WHERE is_published = true";
  const params: unknown[] = [];
  let idx = 1;

  if (category) {
    sql += ` AND category = $${idx++}`;
    params.push(category);
  }

  sql += ` ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $${idx}`;
  params.push(limit);

  const result = await db.query(sql, params);
  return NextResponse.json(result.rows);
}
