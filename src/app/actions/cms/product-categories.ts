"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { generateSlug } from "@/lib/slug";
import * as lib from "@/lib/cms/product-categories";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createProductCategoryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "");
  const slugInput = String(formData.get("slug") || "");
  const slug = slugInput || generateSlug(name);
  const description = String(formData.get("description") || "") || null;
  const icon = String(formData.get("icon") || "") || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.createProductCategory({
    name,
    slug,
    description,
    icon,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/product-categories");
  void triggerFrontendRevalidation(["/produk", "/"]);
  redirect("/cms/product-categories");
}

export async function updateProductCategoryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const name = String(formData.get("name") || "");
  const slugInput = String(formData.get("slug") || "");
  const slug = slugInput || generateSlug(name);
  const description = String(formData.get("description") || "") || null;
  const icon = String(formData.get("icon") || "") || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.updateProductCategory(id, {
    name,
    slug,
    description,
    icon,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/product-categories");
  revalidatePath(`/cms/product-categories/${id}/edit`);
  void triggerFrontendRevalidation(["/produk", "/"]);
  redirect("/cms/product-categories");
}

export async function deleteProductCategoryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await lib.deleteProductCategory(id);

  revalidatePath("/cms/product-categories");
  void triggerFrontendRevalidation(["/produk", "/"]);
}

export async function toggleProductCategoryPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";
  if (!id) return;

  await lib.updateProductCategory(id, { isPublished });

  revalidatePath("/cms/product-categories");
  void triggerFrontendRevalidation(["/produk", "/"]);
}
