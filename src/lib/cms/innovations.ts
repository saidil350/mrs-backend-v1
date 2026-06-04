import { getDb } from "@/lib/db";
import type { Innovation } from "@/types";

function mapRow(row: Record<string, unknown>): Innovation {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    icon: row.icon ? String(row.icon) : null,
    imageId: row.image_id ? String(row.image_id) : null,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    isPublished: Boolean(row.is_published),
    sortOrder: Number(row.sort_order),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllInnovations() {
  const result = await getDb().query(
    "SELECT * FROM innovations ORDER BY sort_order, title",
  );
  return result.rows.map(mapRow);
}

export async function getInnovationById(id: string) {
  const result = await getDb().query(
    "SELECT * FROM innovations WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createInnovation(data: {
  title: string;
  description: string;
  icon?: string | null;
  imageId?: string | null;
  tags?: string[];
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const result = await getDb().query(
    `INSERT INTO innovations (title, description, icon, image_id, tags, sort_order, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.title,
      data.description,
      data.icon ?? null,
      data.imageId ?? null,
      data.tags ?? [],
      data.sortOrder ?? 0,
      data.isPublished ?? false,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function updateInnovation(
  id: string,
  data: {
    title?: string;
    description?: string;
    icon?: string | null;
    imageId?: string | null;
    tags?: string[];
    sortOrder?: number;
    isPublished?: boolean;
  },
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(data.description);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${idx++}`);
    values.push(data.icon);
  }
  if (data.imageId !== undefined) {
    fields.push(`image_id = $${idx++}`);
    values.push(data.imageId);
  }
  if (data.tags !== undefined) {
    fields.push(`tags = $${idx++}`);
    values.push(data.tags);
  }
  if (data.sortOrder !== undefined) {
    fields.push(`sort_order = $${idx++}`);
    values.push(data.sortOrder);
  }
  if (data.isPublished !== undefined) {
    fields.push(`is_published = $${idx++}`);
    values.push(data.isPublished);
  }

  if (fields.length === 0) return getInnovationById(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const result = await getDb().query(
    `UPDATE innovations SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function deleteInnovation(id: string) {
  const result = await getDb().query(
    "DELETE FROM innovations WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rows[0]?.id ?? null;
}
