import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const result = await db.query(
      "SELECT id, alt, caption, filename, mime_type AS \"mimeType\", url FROM cms_media ORDER BY created_at DESC",
    );
    return NextResponse.json(result.rows);
  } catch {
    return NextResponse.json([]);
  }
}
