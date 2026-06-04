import { getDb } from "@/lib/db";
import type { Product, GalleryItem, Specification } from "@/types";

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    excerpt: String(row.excerpt),
    description: row.description ? String(row.description) : null,
    categoryId: row.category_id ? String(row.category_id) : null,
    gallery: Array.isArray(row.gallery) ? (row.gallery as GalleryItem[]) : [],
    specifications: Array.isArray(row.specifications) ? (row.specifications as Specification[]) : [],
    pricingInfo: row.pricing_info ? String(row.pricing_info) : null,
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 100),
    isPublished: Boolean(row.is_published),
    seoMetaTitle: row.seo_meta_title ? String(row.seo_meta_title) : null,
    seoMetaDescription: row.seo_meta_description ? String(row.seo_meta_description) : null,
    seoOgImageId: row.seo_og_image_id ? String(row.seo_og_image_id) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllProducts() {
  const result = await getDb().query(
    "SELECT * FROM products ORDER BY sort_order, created_at DESC",
  );
  return result.rows.map(mapProduct);
}

export async function getProductById(id: string) {
  const result = await getDb().query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
}

export async function createProduct(data: {
  name: string;
  slug: string;
  excerpt: string;
  description?: string;
  categoryId?: string;
  gallery: GalleryItem[];
  specifications: Specification[];
  pricingInfo?: string;
  featured?: boolean;
  sortOrder?: number;
  isPublished?: boolean;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoOgImageId?: string;
}) {
  const result = await getDb().query(
    `INSERT INTO products (name, slug, excerpt, description, category_id, gallery, specifications, pricing_info, featured, sort_order, is_published, seo_meta_title, seo_meta_description, seo_og_image_id)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      data.name,
      data.slug,
      data.excerpt,
      data.description ?? null,
      data.categoryId ?? null,
      JSON.stringify(data.gallery),
      JSON.stringify(data.specifications),
      data.pricingInfo ?? null,
      data.featured ?? false,
      data.sortOrder ?? 100,
      data.isPublished ?? false,
      data.seoMetaTitle ?? null,
      data.seoMetaDescription ?? null,
      data.seoOgImageId ?? null,
    ],
  );
  return mapProduct(result.rows[0]);
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    excerpt?: string;
    description?: string;
    categoryId?: string;
    gallery?: GalleryItem[];
    specifications?: Specification[];
    pricingInfo?: string;
    featured?: boolean;
    sortOrder?: number;
    isPublished?: boolean;
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    seoOgImageId?: string;
  },
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.slug !== undefined) { fields.push(`slug = $${idx++}`); values.push(data.slug); }
  if (data.excerpt !== undefined) { fields.push(`excerpt = $${idx++}`); values.push(data.excerpt); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.categoryId !== undefined) { fields.push(`category_id = $${idx++}`); values.push(data.categoryId); }
  if (data.gallery !== undefined) { fields.push(`gallery = $${idx++}::jsonb`); values.push(JSON.stringify(data.gallery)); }
  if (data.specifications !== undefined) { fields.push(`specifications = $${idx++}::jsonb`); values.push(JSON.stringify(data.specifications)); }
  if (data.pricingInfo !== undefined) { fields.push(`pricing_info = $${idx++}`); values.push(data.pricingInfo); }
  if (data.featured !== undefined) { fields.push(`featured = $${idx++}`); values.push(data.featured); }
  if (data.sortOrder !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(data.sortOrder); }
  if (data.isPublished !== undefined) { fields.push(`is_published = $${idx++}`); values.push(data.isPublished); }
  if (data.seoMetaTitle !== undefined) { fields.push(`seo_meta_title = $${idx++}`); values.push(data.seoMetaTitle); }
  if (data.seoMetaDescription !== undefined) { fields.push(`seo_meta_description = $${idx++}`); values.push(data.seoMetaDescription); }
  if (data.seoOgImageId !== undefined) { fields.push(`seo_og_image_id = $${idx++}`); values.push(data.seoOgImageId); }

  fields.push("updated_at = now()");
  values.push(id);

  const result = await getDb().query(
    `UPDATE products SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
}

export async function deleteProduct(id: string) {
  await getDb().query("DELETE FROM products WHERE id = $1", [id]);
}
