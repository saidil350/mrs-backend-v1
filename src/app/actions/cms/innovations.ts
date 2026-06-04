"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import * as lib from "@/lib/cms/innovations";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createInnovationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const icon = String(formData.get("icon") || "") || null;
  const imageId = String(formData.get("imageId") || "") || null;
  const tagsRaw = String(formData.get("tags") || "[]");
  const tags: string[] = JSON.parse(tagsRaw);
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.createInnovation({
    title,
    description,
    icon,
    imageId,
    tags,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/innovations");
  void triggerFrontendRevalidation(["/layanan", "/"]);
  redirect("/cms/innovations");
}

export async function updateInnovationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const icon = String(formData.get("icon") || "") || null;
  const imageId = String(formData.get("imageId") || "") || null;
  const tagsRaw = String(formData.get("tags") || "[]");
  const tags: string[] = JSON.parse(tagsRaw);
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.updateInnovation(id, {
    title,
    description,
    icon,
    imageId,
    tags,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/innovations");
  revalidatePath(`/cms/innovations/${id}/edit`);
  void triggerFrontendRevalidation(["/layanan", "/"]);
  redirect("/cms/innovations");
}

export async function deleteInnovationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await lib.deleteInnovation(id);

  revalidatePath("/cms/innovations");
  void triggerFrontendRevalidation(["/layanan", "/"]);
}

export async function toggleInnovationPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";
  if (!id) return;

  await lib.updateInnovation(id, { isPublished });

  revalidatePath("/cms/innovations");
  void triggerFrontendRevalidation(["/layanan", "/"]);
}
