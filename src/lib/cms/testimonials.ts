import { getDb } from "@/lib/db";
import type { Testimonial } from "@/types";

function mapRow(row: Record<string, unknown>): Testimonial {
  return {
    id: String(row.id),
    name: String(row.name),
    company: row.company ? String(row.company) : null,
    role: row.role ? String(row.role) : null,
    quote: String(row.quote),
    avatarId: row.avatar_id ? String(row.avatar_id) : null,
    rating: row.rating ? Number(row.rating) : null,
    isPublished: Boolean(row.is_published),
    sortOrder: Number(row.sort_order),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllTestimonials() {
  const result = await getDb().query(
    "SELECT * FROM testimonials ORDER BY sort_order, name",
  );
  return result.rows.map(mapRow);
}

export async function getTestimonialById(id: string) {
  const result = await getDb().query(
    "SELECT * FROM testimonials WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createTestimonial(data: {
  name: string;
  company?: string | null;
  role?: string | null;
  quote: string;
  avatarId?: string | null;
  rating?: number | null;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const result = await getDb().query(
    `INSERT INTO testimonials (name, company, role, quote, avatar_id, rating, sort_order, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.name,
      data.company ?? null,
      data.role ?? null,
      data.quote,
      data.avatarId ?? null,
      data.rating ?? null,
      data.sortOrder ?? 0,
      data.isPublished ?? false,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function updateTestimonial(
  id: string,
  data: {
    name?: string;
    company?: string | null;
    role?: string | null;
    quote?: string;
    avatarId?: string | null;
    rating?: number | null;
    sortOrder?: number;
    isPublished?: boolean;
  },
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.company !== undefined) {
    fields.push(`company = $${idx++}`);
    values.push(data.company);
  }
  if (data.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(data.role);
  }
  if (data.quote !== undefined) {
    fields.push(`quote = $${idx++}`);
    values.push(data.quote);
  }
  if (data.avatarId !== undefined) {
    fields.push(`avatar_id = $${idx++}`);
    values.push(data.avatarId);
  }
  if (data.rating !== undefined) {
    fields.push(`rating = $${idx++}`);
    values.push(data.rating);
  }
  if (data.sortOrder !== undefined) {
    fields.push(`sort_order = $${idx++}`);
    values.push(data.sortOrder);
  }
  if (data.isPublished !== undefined) {
    fields.push(`is_published = $${idx++}`);
    values.push(data.isPublished);
  }

  if (fields.length === 0) return getTestimonialById(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const result = await getDb().query(
    `UPDATE testimonials SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function deleteTestimonial(id: string) {
  const result = await getDb().query(
    "DELETE FROM testimonials WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rows[0]?.id ?? null;
}
