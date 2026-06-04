"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { generateSlug } from "@/lib/slug";
import * as postsLib from "@/lib/cms/posts";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";
import type { PostCategory } from "@/types";

const VALID_CATEGORIES: PostCategory[] = ["packaging", "industri", "inovasi", "sertifikasi", "umum"];

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "") || generateSlug(title);
  const excerpt = String(formData.get("excerpt") || "");
  const thumbnailId = String(formData.get("thumbnailId") || "") || undefined;
  const categoryRaw = String(formData.get("category") || "umum");
  const category = VALID_CATEGORIES.includes(categoryRaw as PostCategory)
    ? (categoryRaw as PostCategory)
    : "umum";
  const content = String(formData.get("content") || "") || undefined;
  const author = String(formData.get("author") || "") || undefined;
  const isPublished = formData.get("isPublished") === "on";
  const seoMetaTitle = String(formData.get("seoMetaTitle") || "") || undefined;
  const seoMetaDescription = String(formData.get("seoMetaDescription") || "") || undefined;
  const seoOgImageId = String(formData.get("seoOgImageId") || "") || undefined;

  const tagsJson = String(formData.get("tags") || "[]");
  let tags: string[] = [];
  try { tags = JSON.parse(tagsJson); } catch { /* ignore */ }

  await postsLib.createPost({
    title,
    slug,
    excerpt,
    thumbnailId,
    category,
    content,
    tags,
    author,
    isPublished,
    seoMetaTitle,
    seoMetaDescription,
    seoOgImageId,
  });

  revalidatePath("/cms/posts");
  void triggerFrontendRevalidation(["/berita", "/"]);
  redirect("/cms/posts");
}

export async function updatePostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const excerpt = String(formData.get("excerpt") || "");
  const thumbnailId = String(formData.get("thumbnailId") || "");
  const categoryRaw = String(formData.get("category") || "");
  const category = VALID_CATEGORIES.includes(categoryRaw as PostCategory)
    ? (categoryRaw as PostCategory)
    : undefined;
  const content = String(formData.get("content") || "");
  const author = String(formData.get("author") || "");
  const isPublished = formData.get("isPublished") === "on";
  const seoMetaTitle = String(formData.get("seoMetaTitle") || "");
  const seoMetaDescription = String(formData.get("seoMetaDescription") || "");
  const seoOgImageId = String(formData.get("seoOgImageId") || "");

  const tagsJson = String(formData.get("tags") || "[]");
  let tags: string[] = [];
  try { tags = JSON.parse(tagsJson); } catch { /* ignore */ }

  await postsLib.updatePost(id, {
    title: title || undefined,
    slug: slug || undefined,
    excerpt: excerpt || undefined,
    thumbnailId: thumbnailId || undefined,
    category,
    content: content || undefined,
    tags,
    author: author || undefined,
    isPublished,
    seoMetaTitle: seoMetaTitle || undefined,
    seoMetaDescription: seoMetaDescription || undefined,
    seoOgImageId: seoOgImageId || undefined,
  });

  revalidatePath("/cms/posts");
  revalidatePath(`/cms/posts/${id}`);
  void triggerFrontendRevalidation(["/berita", "/"]);
  redirect("/cms/posts");
}

export async function deletePostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await postsLib.deletePost(id);
  revalidatePath("/cms/posts");
  void triggerFrontendRevalidation(["/berita", "/"]);
}

export async function togglePostPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";

  await postsLib.updatePost(id, { isPublished: !isPublished });
  revalidatePath("/cms/posts");
  void triggerFrontendRevalidation(["/berita", "/"]);
}
