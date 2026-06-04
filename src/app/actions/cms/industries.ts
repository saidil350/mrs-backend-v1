"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import * as lib from "@/lib/cms/industries";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createIndustryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "");
  const icon = String(formData.get("icon") || "") || null;
  const imageId = String(formData.get("imageId") || "") || null;
  const description = String(formData.get("description") || "");
  const expertiseSummary = String(formData.get("expertiseSummary") || "") || null;
  const applicationsRaw = String(formData.get("applications") || "[]");
  const applications: string[] = JSON.parse(applicationsRaw);
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.createIndustry({
    name,
    icon,
    imageId,
    description,
    expertiseSummary,
    applications,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/industries");
  void triggerFrontendRevalidation(["/layanan", "/"]);
  redirect("/cms/industries");
}

export async function updateIndustryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const name = String(formData.get("name") || "");
  const icon = String(formData.get("icon") || "") || null;
  const imageId = String(formData.get("imageId") || "") || null;
  const description = String(formData.get("description") || "");
  const expertiseSummary = String(formData.get("expertiseSummary") || "") || null;
  const applicationsRaw = String(formData.get("applications") || "[]");
  const applications: string[] = JSON.parse(applicationsRaw);
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.updateIndustry(id, {
    name,
    icon,
    imageId,
    description,
    expertiseSummary,
    applications,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/industries");
  revalidatePath(`/cms/industries/${id}/edit`);
  void triggerFrontendRevalidation(["/layanan", "/"]);
  redirect("/cms/industries");
}

export async function deleteIndustryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await lib.deleteIndustry(id);

  revalidatePath("/cms/industries");
  void triggerFrontendRevalidation(["/layanan", "/"]);
}

export async function toggleIndustryPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";
  if (!id) return;

  await lib.updateIndustry(id, { isPublished });

  revalidatePath("/cms/industries");
  void triggerFrontendRevalidation(["/layanan", "/"]);
}
