"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isValidLeadStatus } from "@/lib/validation";

export async function updateLeadStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "");
  if (!leadId || !isValidLeadStatus(status)) return;

  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const current = await client.query("SELECT status FROM leads WHERE id = $1 FOR UPDATE", [leadId]);
    const oldStatus = current.rows[0]?.status;
    if (!oldStatus || oldStatus === status) {
      await client.query("COMMIT");
      return;
    }

    await client.query("UPDATE leads SET status = $1, updated_at = now() WHERE id = $2", [status, leadId]);
    await client.query(
      `INSERT INTO lead_activities (lead_id, user_id, type, body, from_status, to_status)
       VALUES ($1, $2, 'status_change', 'Status lead diperbarui.', $3, $4)`,
      [leadId, user.id, oldStatus, status],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  revalidatePath("/dashboard");
  revalidatePath(`/leads/${leadId}`);
}

export async function assignLeadAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const leadId = String(formData.get("leadId") || "");
  const assignToId = String(formData.get("userId") || "");
  if (!leadId) return;

  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Ambil assignee lama
    const current = await client.query("SELECT assigned_to FROM leads WHERE id = $1 FOR UPDATE", [leadId]);
    const oldAssignee = current.rows[0]?.assigned_to ?? null;

    // Null = unassign, string = assign ke user
    const newAssignee = assignToId || null;
    if (oldAssignee === newAssignee) {
      await client.query("COMMIT");
      return;
    }

    await client.query("UPDATE leads SET assigned_to = $1, updated_at = now() WHERE id = $2", [newAssignee, leadId]);

    // Ambil nama user baru (kalau ada)
    let assigneeName = "Tanpa pemilik";
    if (newAssignee) {
      const u = await client.query("SELECT name FROM crm_users WHERE id = $1", [newAssignee]);
      assigneeName = u.rows[0]?.name ?? "Unknown";
    }

    const activityBody = newAssignee
      ? `Lead di-assign ke ${assigneeName}.`
      : `Lead di-unassign.`;

    await client.query(
      `INSERT INTO lead_activities (lead_id, user_id, type, body)
       VALUES ($1, $2, 'note', $3)`,
      [leadId, user.id, activityBody],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  revalidatePath("/dashboard");
  revalidatePath(`/leads/${leadId}`);
}

export async function addLeadNoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const leadId = String(formData.get("leadId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!leadId || !body) return;

  await getDb().query(
    `INSERT INTO lead_activities (lead_id, user_id, type, body)
     VALUES ($1, $2, 'note', $3)`,
    [leadId, user.id, body],
  );

  revalidatePath(`/leads/${leadId}`);
}
