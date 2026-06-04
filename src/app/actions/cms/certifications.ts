"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import * as lib from "@/lib/cms/certifications";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createCertificationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "");
  const issuer = String(formData.get("issuer") || "");
  const logoId = String(formData.get("logoId") || "") || null;
  const year = formData.get("year") ? Number(formData.get("year")) : null;
  const description = String(formData.get("description") || "") || null;
  const documentUrl = String(formData.get("documentUrl") || "") || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.createCertification({
    name,
    issuer,
    logoId,
    year,
    description,
    documentUrl,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/certifications");
  void triggerFrontendRevalidation(["/tentang-kami", "/"]);
  redirect("/cms/certifications");
}

export async function updateCertificationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const name = String(formData.get("name") || "");
  const issuer = String(formData.get("issuer") || "");
  const logoId = String(formData.get("logoId") || "") || null;
  const year = formData.get("year") ? Number(formData.get("year")) : null;
  const description = String(formData.get("description") || "") || null;
  const documentUrl = String(formData.get("documentUrl") || "") || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.updateCertification(id, {
    name,
    issuer,
    logoId,
    year,
    description,
    documentUrl,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/certifications");
  revalidatePath(`/cms/certifications/${id}/edit`);
  void triggerFrontendRevalidation(["/tentang-kami", "/"]);
  redirect("/cms/certifications");
}

export async function deleteCertificationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await lib.deleteCertification(id);

  revalidatePath("/cms/certifications");
  void triggerFrontendRevalidation(["/tentang-kami", "/"]);
}

export async function toggleCertificationPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";
  if (!id) return;

  await lib.updateCertification(id, { isPublished });

  revalidatePath("/cms/certifications");
  void triggerFrontendRevalidation(["/tentang-kami", "/"]);
}
