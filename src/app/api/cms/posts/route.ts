import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateSlug } from "@/lib/slug";

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
    let post = result.rows[0] ?? null;

    // Fallback: if exact slug not found, try matching against a generated slug
    // from stored title/slug values (handles legacy or manually-entered slugs).
    if (!post) {
      const all = await db.query(
        "SELECT * FROM posts WHERE is_published = true",
      );
      const match = all.rows.find((r: any) => {
        const candidate = String(r.slug ?? r.title ?? "");
        return generateSlug(candidate) === String(slug);
      });
      post = match ?? null;
    }

    // Normalize returned slug to be URL-friendly
    if (post) {
      post.slug = generateSlug(String(post.slug ?? post.title ?? ""));
    }

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
  // Normalize slugs in list responses to ensure frontend receives URL-safe slugs
  const rows = result.rows.map((r: any) => ({
    ...r,
    slug: generateSlug(String(r.slug ?? r.title ?? "")),
  }));

  return NextResponse.json(rows);
}
