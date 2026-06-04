import { getDb } from "@/lib/db";
import type { CmsMedia } from "@/types";

function mapMedia(row: Record<string, unknown>): CmsMedia {
  return {
    id: String(row.id),
    alt: String(row.alt),
    caption: row.caption ? String(row.caption) : null,
    filename: String(row.filename),
    mimeType: String(row.mime_type),
    filesize: row.filesize ? Number(row.filesize) : null,
    width: row.width ? Number(row.width) : null,
    height: row.height ? Number(row.height) : null,
    url: String(row.url),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllMedia() {
  const result = await getDb().query(
    "SELECT * FROM cms_media ORDER BY created_at DESC",
  );
  return result.rows.map(mapMedia);
}

export async function getMediaById(id: string) {
  const result = await getDb().query("SELECT * FROM cms_media WHERE id = $1", [
    id,
  ]);
  return result.rows[0] ? mapMedia(result.rows[0]) : null;
}

export async function createMedia(data: {
  alt: string;
  caption?: string;
  filename: string;
  mimeType: string;
  filesize?: number;
  width?: number;
  height?: number;
  url: string;
}) {
  const result = await getDb().query(
    `INSERT INTO cms_media (alt, caption, filename, mime_type, filesize, width, height, url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.alt,
      data.caption ?? null,
      data.filename,
      data.mimeType,
      data.filesize ?? null,
      data.width ?? null,
      data.height ?? null,
      data.url,
    ],
  );
  return mapMedia(result.rows[0]);
}

export async function updateMedia(
  id: string,
  data: { alt?: string; caption?: string },
) {
  const result = await getDb().query(
    `UPDATE cms_media SET alt = COALESCE($1, alt), caption = $2, updated_at = now()
     WHERE id = $3
     RETURNING *`,
    [data.alt ?? null, data.caption ?? null, id],
  );
  return result.rows[0] ? mapMedia(result.rows[0]) : null;
}

export async function deleteMedia(id: string) {
  const result = await getDb().query(
    "DELETE FROM cms_media WHERE id = $1 RETURNING filename",
    [id],
  );
  return result.rows[0]?.filename ?? null;
}
