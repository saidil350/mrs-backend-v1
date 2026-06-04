import { getDb } from "@/lib/db";
import type { Certification } from "@/types";

function mapRow(row: Record<string, unknown>): Certification {
  return {
    id: String(row.id),
    name: String(row.name),
    issuer: String(row.issuer),
    logoId: row.logo_id ? String(row.logo_id) : null,
    year: row.year ? Number(row.year) : null,
    description: row.description ? String(row.description) : null,
    documentUrl: row.document_url ? String(row.document_url) : null,
    isPublished: Boolean(row.is_published),
    sortOrder: Number(row.sort_order),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllCertifications() {
  const result = await getDb().query(
    "SELECT * FROM certifications ORDER BY sort_order, name",
  );
  return result.rows.map(mapRow);
}

export async function getCertificationById(id: string) {
  const result = await getDb().query(
    "SELECT * FROM certifications WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createCertification(data: {
  name: string;
  issuer: string;
  logoId?: string | null;
  year?: number | null;
  description?: string | null;
  documentUrl?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const result = await getDb().query(
    `INSERT INTO certifications (name, issuer, logo_id, year, description, document_url, sort_order, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.name,
      data.issuer,
      data.logoId ?? null,
      data.year ?? null,
      data.description ?? null,
      data.documentUrl ?? null,
      data.sortOrder ?? 0,
      data.isPublished ?? false,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function updateCertification(
  id: string,
  data: {
    name?: string;
    issuer?: string;
    logoId?: string | null;
    year?: number | null;
    description?: string | null;
    documentUrl?: string | null;
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
  if (data.issuer !== undefined) {
    fields.push(`issuer = $${idx++}`);
    values.push(data.issuer);
  }
  if (data.logoId !== undefined) {
    fields.push(`logo_id = $${idx++}`);
    values.push(data.logoId);
  }
  if (data.year !== undefined) {
    fields.push(`year = $${idx++}`);
    values.push(data.year);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(data.description);
  }
  if (data.documentUrl !== undefined) {
    fields.push(`document_url = $${idx++}`);
    values.push(data.documentUrl);
  }
  if (data.sortOrder !== undefined) {
    fields.push(`sort_order = $${idx++}`);
    values.push(data.sortOrder);
  }
  if (data.isPublished !== undefined) {
    fields.push(`is_published = $${idx++}`);
    values.push(data.isPublished);
  }

  if (fields.length === 0) return getCertificationById(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const result = await getDb().query(
    `UPDATE certifications SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function deleteCertification(id: string) {
  const result = await getDb().query(
    "DELETE FROM certifications WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rows[0]?.id ?? null;
}
