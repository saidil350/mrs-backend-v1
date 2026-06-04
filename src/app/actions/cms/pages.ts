"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { generateSlug } from "@/lib/slug";
import * as pagesLib from "@/lib/cms/pages";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createPageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "") || generateSlug(title);
  const excerpt = String(formData.get("excerpt") || "") || undefined;
  const content = String(formData.get("content") || "") || undefined;
  const isPublished = formData.get("isPublished") === "on";
  const seoMetaTitle = String(formData.get("seoMetaTitle") || "") || undefined;
  const seoMetaDescription = String(formData.get("seoMetaDescription") || "") || undefined;
  const seoOgImageId = String(formData.get("seoOgImageId") || "") || undefined;

  await pagesLib.createPage({
    title,
    slug,
    excerpt,
    content,
    isPublished,
    seoMetaTitle,
    seoMetaDescription,
    seoOgImageId,
  });

  revalidatePath("/cms/pages");
  void triggerFrontendRevalidation(["/"]);
  redirect("/cms/pages");
}

export async function updatePageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const excerpt = String(formData.get("excerpt") || "");
  const content = String(formData.get("content") || "");
  const isPublished = formData.get("isPublished") === "on";
  const seoMetaTitle = String(formData.get("seoMetaTitle") || "");
  const seoMetaDescription = String(formData.get("seoMetaDescription") || "");
  const seoOgImageId = String(formData.get("seoOgImageId") || "");

  await pagesLib.updatePage(id, {
    title: title || undefined,
    slug: slug || undefined,
    excerpt: excerpt || undefined,
    content: content || undefined,
    isPublished,
    seoMetaTitle: seoMetaTitle || undefined,
    seoMetaDescription: seoMetaDescription || undefined,
    seoOgImageId: seoOgImageId || undefined,
  });

  revalidatePath("/cms/pages");
  revalidatePath(`/cms/pages/${id}`);
  void triggerFrontendRevalidation(["/"]);
  redirect("/cms/pages");
}

export async function deletePageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await pagesLib.deletePage(id);
  revalidatePath("/cms/pages");
  void triggerFrontendRevalidation(["/"]);
}

export async function togglePagePublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";

  await pagesLib.updatePage(id, { isPublished: !isPublished });
  revalidatePath("/cms/pages");
  void triggerFrontendRevalidation(["/"]);
}
