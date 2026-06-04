import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") || 100), 200);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

  const db = getDb();
  const result = await db.query(
    "SELECT * FROM certifications WHERE is_published = true ORDER BY sort_order, created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return NextResponse.json(result.rows);
}
