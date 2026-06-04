import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();

  const result = await db.query("SELECT * FROM cms_media WHERE id = $1", [id]);
  const media = result.rows[0] ?? null;

  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  return NextResponse.json(media);
}
