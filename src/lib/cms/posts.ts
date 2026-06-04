import { getDb } from "@/lib/db";
import type { Post, PostCategory } from "@/types";

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: String(row.excerpt),
    thumbnailId: row.thumbnail_id ? String(row.thumbnail_id) : null,
    category: String(row.category) as PostCategory,
    content: row.content ? String(row.content) : null,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    author: String(row.author ?? "Tim Redaksi"),
    publishedAt: row.published_at ? new Date(String(row.published_at)).toISOString() : null,
    isPublished: Boolean(row.is_published),
    seoMetaTitle: row.seo_meta_title ? String(row.seo_meta_title) : null,
    seoMetaDescription: row.seo_meta_description ? String(row.seo_meta_description) : null,
    seoOgImageId: row.seo_og_image_id ? String(row.seo_og_image_id) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllPosts() {
  const result = await getDb().query(
    "SELECT * FROM posts ORDER BY created_at DESC",
  );
  return result.rows.map(mapPost);
}

export async function getPostById(id: string) {
  const result = await getDb().query("SELECT * FROM posts WHERE id = $1", [id]);
  return result.rows[0] ? mapPost(result.rows[0]) : null;
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  thumbnailId?: string;
  category?: PostCategory;
  content?: string;
  tags?: string[];
  author?: string;
  isPublished?: boolean;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoOgImageId?: string;
}) {
  const result = await getDb().query(
    `INSERT INTO posts (title, slug, excerpt, thumbnail_id, category, content, tags, author, published_at, is_published, seo_meta_title, seo_meta_description, seo_og_image_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.excerpt,
      data.thumbnailId ?? null,
      data.category ?? "umum",
      data.content ?? null,
      data.tags ?? [],
      data.author ?? "Tim Redaksi",
      data.isPublished ? new Date().toISOString() : null,
      data.isPublished ?? false,
      data.seoMetaTitle ?? null,
      data.seoMetaDescription ?? null,
      data.seoOgImageId ?? null,
    ],
  );
  return mapPost(result.rows[0]);
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    thumbnailId?: string;
    category?: PostCategory;
    content?: string;
    tags?: string[];
    author?: string;
    isPublished?: boolean;
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    seoOgImageId?: string;
  },
) {
  // If publishing for first time, set published_at
  const setPublishedAt = data.isPublished ? ", published_at = COALESCE(published_at, now())" : "";

  const result = await getDb().query(
    `UPDATE posts SET
       title = COALESCE($1, title),
       slug = COALESCE($2, slug),
       excerpt = COALESCE($3, excerpt),
       thumbnail_id = $4,
       category = COALESCE($5, category),
       content = $6,
       tags = COALESCE($7, tags),
       author = COALESCE($8, author),
       is_published = COALESCE($9, is_published),
       seo_meta_title = $10,
       seo_meta_description = $11,
       seo_og_image_id = $12,
       updated_at = now()
       ${setPublishedAt}
     WHERE id = $13
     RETURNING *`,
    [
      data.title ?? null,
      data.slug ?? null,
      data.excerpt ?? null,
      data.thumbnailId ?? null,
      data.category ?? null,
      data.content ?? null,
      data.tags ?? null,
      data.author ?? null,
      data.isPublished ?? null,
      data.seoMetaTitle ?? null,
      data.seoMetaDescription ?? null,
      data.seoOgImageId ?? null,
      id,
    ],
  );
  return result.rows[0] ? mapPost(result.rows[0]) : null;
}

export async function deletePost(id: string) {
  await getDb().query("DELETE FROM posts WHERE id = $1", [id]);
}
