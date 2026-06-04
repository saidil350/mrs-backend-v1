"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { generateSlug } from "@/lib/slug";
import * as productsLib from "@/lib/cms/products";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createProductAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "");
  const slug = String(formData.get("slug") || "") || generateSlug(name);
  const excerpt = String(formData.get("excerpt") || "");
  const description = String(formData.get("description") || "") || undefined;
  const categoryId = String(formData.get("categoryId") || "") || undefined;
  const pricingInfo = String(formData.get("pricingInfo") || "") || undefined;
  const featured = formData.get("featured") === "on";
  const sortOrderStr = String(formData.get("sortOrder") || "100");
  const isPublished = formData.get("isPublished") === "on";
  const seoMetaTitle = String(formData.get("seoMetaTitle") || "") || undefined;
  const seoMetaDescription = String(formData.get("seoMetaDescription") || "") || undefined;
  const seoOgImageId = String(formData.get("seoOgImageId") || "") || undefined;

  const galleryJson = String(formData.get("gallery") || "[]");
  const specsJson = String(formData.get("specifications") || "[]");

  let gallery: { imageId: string; caption?: string }[] = [];
  let specifications: { label: string; value: string }[] = [];
  try { gallery = JSON.parse(galleryJson); } catch { /* ignore */ }
  try { specifications = JSON.parse(specsJson); } catch { /* ignore */ }

  await productsLib.createProduct({
    name,
    slug,
    excerpt,
    description,
    categoryId,
    gallery,
    specifications,
    pricingInfo,
    featured,
    sortOrder: Number(sortOrderStr),
    isPublished,
    seoMetaTitle,
    seoMetaDescription,
    seoOgImageId,
  });

  revalidatePath("/cms/products");
  void triggerFrontendRevalidation(["/produk", "/"]);
  redirect("/cms/products");
}

export async function updateProductAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const name = String(formData.get("name") || "");
  const slug = String(formData.get("slug") || "");
  const excerpt = String(formData.get("excerpt") || "");
  const description = String(formData.get("description") || "");
  const categoryId = String(formData.get("categoryId") || "");
  const pricingInfo = String(formData.get("pricingInfo") || "");
  const featured = formData.get("featured") === "on";
  const sortOrderStr = String(formData.get("sortOrder") || "100");
  const isPublished = formData.get("isPublished") === "on";
  const seoMetaTitle = String(formData.get("seoMetaTitle") || "");
  const seoMetaDescription = String(formData.get("seoMetaDescription") || "");
  const seoOgImageId = String(formData.get("seoOgImageId") || "");

  const galleryJson = String(formData.get("gallery") || "[]");
  const specsJson = String(formData.get("specifications") || "[]");

  let gallery: { imageId: string; caption?: string }[] = [];
  let specifications: { label: string; value: string }[] = [];
  try { gallery = JSON.parse(galleryJson); } catch { /* ignore */ }
  try { specifications = JSON.parse(specsJson); } catch { /* ignore */ }

  await productsLib.updateProduct(id, {
    name: name || undefined,
    slug: slug || undefined,
    excerpt: excerpt || undefined,
    description: description || undefined,
    categoryId: categoryId || undefined,
    gallery,
    specifications,
    pricingInfo: pricingInfo || undefined,
    featured,
    sortOrder: Number(sortOrderStr),
    isPublished,
    seoMetaTitle: seoMetaTitle || undefined,
    seoMetaDescription: seoMetaDescription || undefined,
    seoOgImageId: seoOgImageId || undefined,
  });

  revalidatePath("/cms/products");
  revalidatePath(`/cms/products/${id}`);
  void triggerFrontendRevalidation(["/produk", "/"]);
  redirect("/cms/products");
}

export async function deleteProductAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await productsLib.deleteProduct(id);
  revalidatePath("/cms/products");
  void triggerFrontendRevalidation(["/produk", "/"]);
}

export async function toggleProductPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";

  await productsLib.updateProduct(id, { isPublished: !isPublished });
  revalidatePath("/cms/products");
  void triggerFrontendRevalidation(["/produk", "/"]);
}
