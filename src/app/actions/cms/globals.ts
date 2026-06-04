"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import * as globalsLib from "@/lib/cms/globals";
import { triggerFrontendRevalidation } from "@/lib/frontend-revalidate";

export async function updateGlobalAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const key = String(formData.get("key") || "");
  const dataJson = String(formData.get("data") || "{}");

  if (!key) return;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(dataJson);
  } catch {
    return;
  }

  await globalsLib.updateGlobal(key, data);
  revalidatePath(`/cms/globals/${key}`);
  revalidatePath("/cms/globals");
  void triggerFrontendRevalidation(["/"]);
}
