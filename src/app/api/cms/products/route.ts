import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const featured = searchParams.get("featured");
  const category = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") || 100), 200);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

  const db = getDb();

  // Single product by slug
  if (slug) {
    const result = await db.query(
      "SELECT * FROM products WHERE slug = $1 AND is_published = true",
      [slug]
    );
    return NextResponse.json(result.rows[0] ?? null);
  }

  // List with optional filters
  // Always JOIN with product_categories for category slug resolution
  const useCategoryJoin = !!category;

  let sql = useCategoryJoin
    ? "SELECT p.* FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id WHERE p.is_published = true"
    : "SELECT * FROM products WHERE is_published = true";

  const params: unknown[] = [];
  let idx = 1;

  if (category) {
    sql += ` AND pc.slug = $${idx++}`;
    params.push(category);
  }

  if (featured === "true") {
    // Use table alias only when JOIN is active
    sql += useCategoryJoin
      ? " AND p.featured = true"
      : " AND featured = true";
  }

  sql += useCategoryJoin
    ? " ORDER BY p.sort_order, p.created_at DESC"
    : " ORDER BY sort_order, created_at DESC";

  sql += ` LIMIT $${idx++} OFFSET $${idx}`;
  params.push(limit, offset);

  const result = await db.query(sql, params);
  return NextResponse.json(result.rows);
}
