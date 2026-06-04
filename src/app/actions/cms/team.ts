"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import * as lib from "@/lib/cms/team";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function createTeamMemberAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "");
  const role = String(formData.get("role") || "");
  const bio = String(formData.get("bio") || "") || null;
  const photoId = String(formData.get("photoId") || "") || null;
  const linkedinUrl = String(formData.get("linkedinUrl") || "") || null;
  const email = String(formData.get("email") || "") || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.createTeamMember({
    name,
    role,
    bio,
    photoId,
    linkedinUrl,
    email,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/team");
  void triggerFrontendRevalidation(["/tentang-kami", "/"]);
  redirect("/cms/team");
}

export async function updateTeamMemberAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const name = String(formData.get("name") || "");
  const role = String(formData.get("role") || "");
  const bio = String(formData.get("bio") || "") || null;
  const photoId = String(formData.get("photoId") || "") || null;
  const linkedinUrl = String(formData.get("linkedinUrl") || "") || null;
  const email = String(formData.get("email") || "") || null;
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isPublished = formData.get("isPublished") === "on";

  await lib.updateTeamMember(id, {
    name,
    role,
    bio,
    photoId,
    linkedinUrl,
    email,
    sortOrder,
    isPublished,
  });

  revalidatePath("/cms/team");
  revalidatePath(`/cms/team/${id}/edit`);
  void triggerFrontendRevalidation(["/tentang-kami", "/"]);
  redirect("/cms/team");
}

export async function deleteTeamMemberAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await lib.deleteTeamMember(id);

  revalidatePath("/cms/team");
  void triggerFrontendRevalidation(["/tentang-kami", "/"]);
}

export async function toggleTeamMemberPublishAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const isPublished = formData.get("isPublished") === "true";
  if (!id) return;

  await lib.updateTeamMember(id, { isPublished });

  revalidatePath("/cms/team");
  void triggerFrontendRevalidation(["/tentang-kami", "/"]);
}
