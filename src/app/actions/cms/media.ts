"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/session";
import * as mediaLib from "@/lib/cms/media";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

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

export async function uploadMediaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`File type ${file.type} not allowed`);
  }

  if (file.size > 10_000_000) {
    throw new Error("File size exceeds 10MB limit");
  }

  const alt = String(formData.get("alt") || file.name);
  const caption = String(formData.get("caption") || "");

  // Ensure upload directory exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Generate unique filename
  const uniqueName = `${randomUUID()}${extFromMime(file.type)}`;
  const filePath = join(UPLOAD_DIR, uniqueName);

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Get image dimensions for images
  let width: number | undefined;
  let height: number | undefined;
  if (file.type.startsWith("image/")) {
    try {
      // Simple dimension extraction — skip if sharp not available
      // We'll store without dimensions for now; can add sharp later
    } catch {
      // ignore
    }
  }

  const media = await mediaLib.createMedia({
    alt,
    caption: caption || undefined,
    filename: uniqueName,
    mimeType: file.type,
    filesize: file.size,
    width,
    height,
    url: `/uploads/${uniqueName}`,
  });

  revalidatePath("/cms/media");
  void triggerFrontendRevalidation(["/"]);
  return media;
}

export async function updateMediaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const alt = String(formData.get("alt") || "");
  const caption = String(formData.get("caption") || "");

  if (!id) return;

  await mediaLib.updateMedia(id, { alt: alt || undefined, caption });

  revalidatePath("/cms/media");
  revalidatePath(`/cms/media/${id}`);
  void triggerFrontendRevalidation(["/"]);
}

export async function deleteMediaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const filename = await mediaLib.deleteMedia(id);
  if (filename) {
    try {
      await unlink(join(UPLOAD_DIR, filename));
    } catch {
      // file already gone — ignore
    }
  }

  revalidatePath("/cms/media");
  void triggerFrontendRevalidation(["/"]);
}
