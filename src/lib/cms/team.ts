import { getDb } from "@/lib/db";
import type { TeamMember } from "@/types";

function mapRow(row: Record<string, unknown>): TeamMember {
  return {
    id: String(row.id),
    name: String(row.name),
    role: String(row.role),
    bio: row.bio ? String(row.bio) : null,
    photoId: row.photo_id ? String(row.photo_id) : null,
    linkedinUrl: row.linkedin_url ? String(row.linkedin_url) : null,
    email: row.email ? String(row.email) : null,
    isPublished: Boolean(row.is_published),
    sortOrder: Number(row.sort_order),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllTeamMembers() {
  const result = await getDb().query(
    "SELECT * FROM team_members ORDER BY sort_order, name",
  );
  return result.rows.map(mapRow);
}

export async function getTeamMemberById(id: string) {
  const result = await getDb().query(
    "SELECT * FROM team_members WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createTeamMember(data: {
  name: string;
  role: string;
  bio?: string | null;
  photoId?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const result = await getDb().query(
    `INSERT INTO team_members (name, role, bio, photo_id, linkedin_url, email, sort_order, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.name,
      data.role,
      data.bio ?? null,
      data.photoId ?? null,
      data.linkedinUrl ?? null,
      data.email ?? null,
      data.sortOrder ?? 0,
      data.isPublished ?? false,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function updateTeamMember(
  id: string,
  data: {
    name?: string;
    role?: string;
    bio?: string | null;
    photoId?: string | null;
    linkedinUrl?: string | null;
    email?: string | null;
    sortOrder?: number;
    isPublished?: boolean;
  },
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(data.role);
  }
  if (data.bio !== undefined) {
    fields.push(`bio = $${idx++}`);
    values.push(data.bio);
  }
  if (data.photoId !== undefined) {
    fields.push(`photo_id = $${idx++}`);
    values.push(data.photoId);
  }
  if (data.linkedinUrl !== undefined) {
    fields.push(`linkedin_url = $${idx++}`);
    values.push(data.linkedinUrl);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email);
  }
  if (data.sortOrder !== undefined) {
    fields.push(`sort_order = $${idx++}`);
    values.push(data.sortOrder);
  }
  if (data.isPublished !== undefined) {
    fields.push(`is_published = $${idx++}`);
    values.push(data.isPublished);
  }

  if (fields.length === 0) return getTeamMemberById(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const result = await getDb().query(
    `UPDATE team_members SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function deleteTeamMember(id: string) {
  const result = await getDb().query(
    "DELETE FROM team_members WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rows[0]?.id ?? null;
}
