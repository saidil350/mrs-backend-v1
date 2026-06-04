import { getDb } from "@/lib/db";
import type { ProductCategory } from "@/types";

function mapRow(row: Record<string, unknown>): ProductCategory {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    icon: row.icon ? String(row.icon) : null,
    sortOrder: Number(row.sort_order),
    isPublished: Boolean(row.is_published),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllProductCategories() {
  const result = await getDb().query(
    "SELECT * FROM product_categories ORDER BY sort_order, name",
  );
  return result.rows.map(mapRow);
}

export async function getProductCategoryById(id: string) {
  const result = await getDb().query(
    "SELECT * FROM product_categories WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function getProductCategoryBySlug(slug: string) {
  const result = await getDb().query(
    "SELECT * FROM product_categories WHERE slug = $1",
    [slug],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createProductCategory(data: {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const result = await getDb().query(
    `INSERT INTO product_categories (name, slug, description, icon, sort_order, is_published)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.name,
      data.slug,
      data.description ?? null,
      data.icon ?? null,
      data.sortOrder ?? 0,
      data.isPublished ?? false,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function updateProductCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    icon?: string | null;
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
  if (data.slug !== undefined) {
    fields.push(`slug = $${idx++}`);
    values.push(data.slug);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(data.description);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${idx++}`);
    values.push(data.icon);
  }
  if (data.sortOrder !== undefined) {
    fields.push(`sort_order = $${idx++}`);
    values.push(data.sortOrder);
  }
  if (data.isPublished !== undefined) {
    fields.push(`is_published = $${idx++}`);
    values.push(data.isPublished);
  }

  if (fields.length === 0) return getProductCategoryById(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const result = await getDb().query(
    `UPDATE product_categories SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function deleteProductCategory(id: string) {
  const result = await getDb().query(
    "DELETE FROM product_categories WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rows[0]?.id ?? null;
}
