import { getDb } from "@/lib/db";
import type { CmsPage } from "@/types";

function mapPage(row: Record<string, unknown>): CmsPage {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    content: row.content ? String(row.content) : null,
    isPublished: Boolean(row.is_published),
    seoMetaTitle: row.seo_meta_title ? String(row.seo_meta_title) : null,
    seoMetaDescription: row.seo_meta_description ? String(row.seo_meta_description) : null,
    seoOgImageId: row.seo_og_image_id ? String(row.seo_og_image_id) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllPages() {
  const result = await getDb().query(
    "SELECT * FROM cms_pages ORDER BY created_at DESC",
  );
  return result.rows.map(mapPage);
}

export async function getPageById(id: string) {
  const result = await getDb().query(
    "SELECT * FROM cms_pages WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapPage(result.rows[0]) : null;
}

export async function getPageBySlug(slug: string) {
  const result = await getDb().query(
    "SELECT * FROM cms_pages WHERE slug = $1",
    [slug],
  );
  return result.rows[0] ? mapPage(result.rows[0]) : null;
}

export async function createPage(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  isPublished?: boolean;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoOgImageId?: string;
}) {
  const result = await getDb().query(
    `INSERT INTO cms_pages (title, slug, excerpt, content, is_published, seo_meta_title, seo_meta_description, seo_og_image_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.excerpt ?? null,
      data.content ?? null,
      data.isPublished ?? false,
      data.seoMetaTitle ?? null,
      data.seoMetaDescription ?? null,
      data.seoOgImageId ?? null,
    ],
  );
  return mapPage(result.rows[0]);
}

export async function updatePage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    isPublished?: boolean;
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    seoOgImageId?: string;
  },
) {
  const result = await getDb().query(
    `UPDATE cms_pages SET
       title = COALESCE($1, title),
       slug = COALESCE($2, slug),
       excerpt = $3,
       content = $4,
       is_published = COALESCE($5, is_published),
       seo_meta_title = $6,
       seo_meta_description = $7,
       seo_og_image_id = $8,
       updated_at = now()
     WHERE id = $9
     RETURNING *`,
    [
      data.title ?? null,
      data.slug ?? null,
      data.excerpt ?? null,
      data.content ?? null,
      data.isPublished ?? null,
      data.seoMetaTitle ?? null,
      data.seoMetaDescription ?? null,
      data.seoOgImageId ?? null,
      id,
    ],
  );
  return result.rows[0] ? mapPage(result.rows[0]) : null;
}

export async function deletePage(id: string) {
  await getDb().query("DELETE FROM cms_pages WHERE id = $1", [id]);
}
