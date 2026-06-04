"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { generateSlug } from "@/lib/slug";
import * as projectsLib from "@/lib/cms/projects";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "") || generateSlug(title);
  const description = String(formData.get("description") || "");
  const imageId = String(formData.get("imageId") || "") || undefined;
  const category = String(formData.get("category") || "") || undefined;
  const client = String(formData.get("client") || "") || undefined;
  const yearStr = String(formData.get("year") || "");
  const sortOrderStr = String(formData.get("sortOrder") || "0");
  const isPublished = formData.get("isPublished") === "on";

  const galleryJson = String(formData.get("gallery") || "[]");
  const tagsJson = String(formData.get("tags") || "[]");

  let gallery: { imageId: string; caption?: string }[] = [];
  let tags: string[] = [];
  try { gallery = JSON.parse(galleryJson); } catch { /* ignore */ }
  try { tags = JSON.parse(tagsJson); } catch { /* ignore */ }

  await projectsLib.createProject({
    title,
    slug,
    description,
    imageId,
    gallery,
    category,
    client,
    year: yearStr ? Number(yearStr) : undefined,
    tags,
    isPublished,
    sortOrder: Number(sortOrderStr),
  });

  revalidatePath("/cms/projects");
  void triggerFrontendRevalidation(["/proyek", "/"]);
  redirect("/cms/projects");
}

export async function updateProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const description = String(formData.get("description") || "");
  const imageId = String(formData.get("imageId") || "");
  const category = String(formData.get("category") || "");
  const client = String(formData.get("client") || "");
  const yearStr = String(formData.get("year") || "");
  const sortOrderStr = String(formData.get("sortOrder") || "0");
  const isPublished = formData.get("isPublished") === "on";

  const galleryJson = String(formData.get("gallery") || "[]");
  const tagsJson = String(formData.get("tags") || "[]");

  let gallery: { imageId: string; caption?: string }[] = [];
  let tags: string[] = [];
  try { gallery = JSON.parse(galleryJson); } catch { /* ignore */ }
  try { tags = JSON.parse(tagsJson); } catch { /* ignore */ }

  await projectsLib.updateProject(id, {
    title: title || undefined,
    slug: slug || undefined,
    description: description || undefined,
    imageId: imageId || undefined,
    gallery,
    category: category || undefined,
    client: client || undefined,
    year: yearStr ? Number(yearStr) : undefined,
    tags,
    isPublished,
    sortOrder: Number(sortOrderStr),
  });

  revalidatePath("/cms/projects");
  revalidatePath(`/cms/projects/${id}`);
  void triggerFrontendRevalidation(["/proyek", "/"]);
  redirect("/cms/projects");
}

export async function deleteProjectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await projectsLib.deleteProject(id);
  revalidatePath("/cms/projects");
  void triggerFrontendRevalidation(["/proyek", "/"]);
}

export async function toggleProjectPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";

  await projectsLib.updateProject(id, { isPublished: !isPublished });
  revalidatePath("/cms/projects");
  void triggerFrontendRevalidation(["/proyek", "/"]);
}
