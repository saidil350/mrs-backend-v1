"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import * as lib from "@/lib/cms/testimonials";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createTestimonialAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "");
  const company = String(formData.get("company") || "") || null;
  const role = String(formData.get("role") || "") || null;
  const quote = String(formData.get("quote") || "");
  const avatarId = String(formData.get("avatarId") || "") || null;
  const rating = formData.get("rating") ? Number(formData.get("rating")) : null;
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.createTestimonial({
    name,
    company,
    role,
    quote,
    avatarId,
    rating,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/testimonials");
  void triggerFrontendRevalidation(["/"]);
  redirect("/cms/testimonials");
}

export async function updateTestimonialAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const name = String(formData.get("name") || "");
  const company = String(formData.get("company") || "") || null;
  const role = String(formData.get("role") || "") || null;
  const quote = String(formData.get("quote") || "");
  const avatarId = String(formData.get("avatarId") || "") || null;
  const rating = formData.get("rating") ? Number(formData.get("rating")) : null;
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.updateTestimonial(id, {
    name,
    company,
    role,
    quote,
    avatarId,
    rating,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/testimonials");
  revalidatePath(`/cms/testimonials/${id}/edit`);
  void triggerFrontendRevalidation(["/"]);
  redirect("/cms/testimonials");
}

export async function deleteTestimonialAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await lib.deleteTestimonial(id);

  revalidatePath("/cms/testimonials");
  void triggerFrontendRevalidation(["/"]);
}

export async function toggleTestimonialPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";
  if (!id) return;

  await lib.updateTestimonial(id, { isPublished });

  revalidatePath("/cms/testimonials");
  void triggerFrontendRevalidation(["/"]);
}
