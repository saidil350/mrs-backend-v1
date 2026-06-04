import pg from "pg";

const cmsUrl = (process.env.CMS_URL || "http://localhost:3001").replace(/\/$/, "");
const cmsToken = process.env.CMS_API_TOKEN;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error("DATABASE_URL is required");
if (!cmsToken) throw new Error("CMS_API_TOKEN is required to read private Payload leads");

const pool = new pg.Pool({ connectionString });

function normalizeStatus(status) {
  if (status === "closed") return "won";
  if (["new", "contacted", "qualified", "proposal_sent", "won", "lost", "rejected"].includes(status)) return status;
  return "new";
}

async function fetchLeads(page = 1) {
  const response = await fetch(`${cmsUrl}/api/leads?limit=100&page=${page}&depth=0`, {
    headers: {
      Authorization: `Bearer ${cmsToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CMS leads: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

try {
  let page = 1;
  let total = 0;

  while (true) {
    const payload = await fetchLeads(page);
    const docs = payload.docs || [];

    for (const lead of docs) {
      await pool.query(
        `INSERT INTO leads (legacy_cms_id, name, phone, email, company, message, source_page, source_url, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (legacy_cms_id) WHERE legacy_cms_id IS NOT NULL DO UPDATE SET
           name = excluded.name,
           phone = excluded.phone,
           email = excluded.email,
           company = excluded.company,
           message = excluded.message,
           source_page = excluded.source_page,
           source_url = excluded.source_url,
           status = excluded.status,
           updated_at = excluded.updated_at`,
        [
          String(lead.id),
          lead.name,
          lead.phone || "-",
          lead.email || null,
          lead.company || null,
          lead.need || lead.message || "-",
          lead.sourcePage || null,
          lead.sourceUrl || null,
          normalizeStatus(lead.status),
          lead.createdAt || new Date().toISOString(),
          lead.updatedAt || lead.createdAt || new Date().toISOString(),
        ],
      );
      total += 1;
    }

    if (!payload.hasNextPage) break;
    page += 1;
  }

  console.log(`Migrated ${total} CMS leads into CRM.`);
} finally {
  await pool.end();
}
