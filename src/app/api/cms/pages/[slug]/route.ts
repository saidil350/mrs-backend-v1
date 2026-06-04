import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const db = getDb();

  const result = await db.query(
    "SELECT * FROM cms_pages WHERE slug = $1 AND is_published = true",
    [slug],
  );

  const page = result.rows[0] ?? null;

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}
