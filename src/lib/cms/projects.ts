import { getDb } from "@/lib/db";
import type { Project, GalleryItem } from "@/types";

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    description: String(row.description),
    imageId: row.image_id ? String(row.image_id) : null,
    gallery: Array.isArray(row.gallery) ? (row.gallery as GalleryItem[]) : [],
    category: row.category ? String(row.category) : null,
    client: row.client ? String(row.client) : null,
    year: row.year ? Number(row.year) : null,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    isPublished: Boolean(row.is_published),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllProjects() {
  const result = await getDb().query(
    "SELECT * FROM projects ORDER BY sort_order, created_at DESC",
  );
  return result.rows.map(mapProject);
}

export async function getProjectById(id: string) {
  const result = await getDb().query(
    "SELECT * FROM projects WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapProject(result.rows[0]) : null;
}

export async function createProject(data: {
  title: string;
  slug: string;
  description: string;
  imageId?: string;
  gallery: GalleryItem[];
  category?: string;
  client?: string;
  year?: number;
  tags: string[];
  isPublished?: boolean;
  sortOrder?: number;
}) {
  const result = await getDb().query(
    `INSERT INTO projects (title, slug, description, image_id, gallery, category, client, year, tags, is_published, sort_order)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.description,
      data.imageId ?? null,
      JSON.stringify(data.gallery),
      data.category ?? null,
      data.client ?? null,
      data.year ?? null,
      data.tags,
      data.isPublished ?? true,
      data.sortOrder ?? 0,
    ],
  );
  return mapProject(result.rows[0]);
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    imageId?: string;
    gallery?: GalleryItem[];
    category?: string;
    client?: string;
    year?: number;
    tags?: string[];
    isPublished?: boolean;
    sortOrder?: number;
  },
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
  if (data.slug !== undefined) { fields.push(`slug = $${idx++}`); values.push(data.slug); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.imageId !== undefined) { fields.push(`image_id = $${idx++}`); values.push(data.imageId); }
  if (data.gallery !== undefined) { fields.push(`gallery = $${idx++}::jsonb`); values.push(JSON.stringify(data.gallery)); }
  if (data.category !== undefined) { fields.push(`category = $${idx++}`); values.push(data.category); }
  if (data.client !== undefined) { fields.push(`client = $${idx++}`); values.push(data.client); }
  if (data.year !== undefined) { fields.push(`year = $${idx++}`); values.push(data.year); }
  if (data.tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(data.tags); }
  if (data.isPublished !== undefined) { fields.push(`is_published = $${idx++}`); values.push(data.isPublished); }
  if (data.sortOrder !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(data.sortOrder); }

  fields.push("updated_at = now()");
  values.push(id);

  const result = await getDb().query(
    `UPDATE projects SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ? mapProject(result.rows[0]) : null;
}

export async function deleteProject(id: string) {
  await getDb().query("DELETE FROM projects WHERE id = $1", [id]);
}
