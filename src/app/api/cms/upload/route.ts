import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createMedia } from "@/lib/cms/media";
import { authenticateApiRequest } from "@/lib/api-auth";
import { isRateLimitedApi } from "@/lib/rate-limit";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
]);

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
  };
  return map[mime] ?? ".bin";
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  // Auth check
  const user = authenticateApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const ip = getClientIp(request);
  if (isRateLimitedApi(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak request. Coba lagi nanti." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    if (file.size > 10_000_000) {
      return NextResponse.json(
        { error: "File size exceeds 10MB" },
        { status: 400 }
      );
    }

    const alt = String(formData.get("alt") || file.name);

    await mkdir(UPLOAD_DIR, { recursive: true });

    const uniqueName = `${randomUUID()}${extFromMime(file.type)}`;
    const filePath = join(UPLOAD_DIR, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const media = await createMedia({
      alt,
      filename: uniqueName,
      mimeType: file.type,
      filesize: file.size,
      url: `/uploads/${uniqueName}`,
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
