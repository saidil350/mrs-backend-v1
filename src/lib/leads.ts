import type { Lead, LeadActivity, LeadStatus } from "@/types";
import { LEAD_STATUSES } from "@/types";
import { getDb } from "./db";
import type { LeadInput } from "./validation";

function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    company: row.company ? String(row.company) : null,
    message: String(row.message),
    sourcePage: row.source_page ? String(row.source_page) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    status: row.status as Lead["status"],
    assignedTo: row.assigned_to ? String(row.assigned_to) : null,
    assignedName: row.assigned_name ? String(row.assigned_name) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapActivity(row: Record<string, unknown>): LeadActivity {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    userId: row.user_id ? String(row.user_id) : null,
    userName: row.user_name ? String(row.user_name) : null,
    type: row.type as LeadActivity["type"],
    body: String(row.body),
    fromStatus: row.from_status as LeadActivity["fromStatus"],
    toStatus: row.to_status as LeadActivity["toStatus"],
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

/**
 * Auto-assign lead ke sales user via round-robin.
 * Mengambil sales yang punya lead aktif paling sedikit.
 */
async function pickSalesUser(db: { query: (sql: string) => Promise<{ rows: Record<string, unknown>[] }> }): Promise<string | null> {
  const result = await db.query(`
    SELECT u.id
    FROM crm_users u
    LEFT JOIN leads l ON l.assigned_to = u.id
      AND l.status NOT IN ('won', 'lost', 'rejected')
    WHERE u.role = 'sales'
    GROUP BY u.id
    ORDER BY count(l.id) ASC, u.created_at ASC
    LIMIT 1
  `);
  return result.rows[0]?.id ? String(result.rows[0].id) : null;
}

export async function createLead(input: LeadInput) {
  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Auto-assign ke sales dengan beban paling ringan
    const assignedTo = await pickSalesUser(client);

    const leadResult = await client.query(
      `INSERT INTO leads (name, phone, email, company, message, source_page, source_url, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.name,
        input.phone,
        input.email,
        input.company,
        input.message,
        input.sourcePage,
        input.sourceUrl,
        assignedTo,
      ],
    );
    const lead = mapLead(leadResult.rows[0]);

    // Activity: lead_created
    const assignNote = assignedTo
      ? `Lead baru masuk dari website dan otomatis di-assign.`
      : `Lead baru masuk dari website (belum di-assign).`;
    await client.query(
      `INSERT INTO lead_activities (lead_id, type, body, to_status)
       VALUES ($1, 'lead_created', $2, 'new')`,
      [lead.id, assignNote],
    );

    await client.query("COMMIT");
    return lead;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export type DashboardData = {
  summary: {
    total: number;
    newCount: number;
    contactedCount: number;
    conversionRate: number;
    wonCount: number;
    totalThisMonth: number;
    totalLastMonth: number;
    unassignedCount: number;
    emailCount: number;
    telegramCount: number;
    whatsappCount: number;
  };
  leads: Lead[];
  pipeline: Record<LeadStatus, number>;
  sources: { source: string; count: number; percentage: number }[];
  trend: { date: string; count: number }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const db = getDb();

  const [summaryResult, recentResult, pipelineResult, sourcesResult, trendResult] =
    await Promise.all([
      // Summary metrics + month comparison
      db.query(`
        SELECT
          count(*)::int AS total,
          count(*) FILTER (WHERE status = 'new')::int AS new_count,
          count(*) FILTER (WHERE status = 'contacted')::int AS contacted_count,
          count(*) FILTER (WHERE status = 'won')::int AS won_count,
          count(*) FILTER (WHERE assigned_to IS NULL)::int AS unassigned_count,
          count(*) FILTER (WHERE email IS NOT NULL AND email != '')::int AS email_count,
          count(*) FILTER (WHERE LOWER(source_page) LIKE '%telegram%')::int AS telegram_count,
          count(*) FILTER (WHERE LOWER(source_page) LIKE '%whatsapp%')::int AS whatsapp_count,
          count(*) FILTER (WHERE created_at >= date_trunc('month', now()))::int AS this_month,
          count(*) FILTER (
            WHERE created_at >= date_trunc('month', now() - interval '1 month')
              AND created_at < date_trunc('month', now())
          )::int AS last_month
        FROM leads
      `),
      // Recent lead (1 terakhir dalam 1 minggu) + assignee name
      db.query(`
        SELECT l.*, u.name AS assigned_name
        FROM leads l
        LEFT JOIN crm_users u ON u.id = l.assigned_to
        WHERE l.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY l.created_at DESC
        LIMIT 1
      `),
      // Pipeline counts (all leads, not just 50)
      db.query("SELECT status, count(*)::int AS cnt FROM leads GROUP BY status"),
      // Lead source breakdown
      db.query(`
        SELECT COALESCE(source_page, 'Lainnya') AS source, count(*)::int AS cnt
        FROM leads
        GROUP BY source_page
        ORDER BY cnt DESC
      `),
      // Lead trend — 14 hari terakhir
      db.query(`
        SELECT
          d.day::date::text AS date,
          count(l.id)::int AS count
        FROM generate_series(
          CURRENT_DATE - interval '13 days',
          CURRENT_DATE,
          interval '1 day'
        ) d(day)
        LEFT JOIN leads l ON l.created_at::date = d.day::date
        GROUP BY d.day
        ORDER BY d.day
      `),
    ]);

  // Summary
  const row = summaryResult.rows[0] ?? {
    total: 0,
    new_count: 0,
    contacted_count: 0,
    won_count: 0,
    unassigned_count: 0,
    email_count: 0,
    telegram_count: 0,
    whatsapp_count: 0,
    this_month: 0,
    last_month: 0,
  };
  const total = Number(row.total);

  // Pipeline map
  const pipeline = LEAD_STATUSES.reduce<Record<LeadStatus, number>>(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<LeadStatus, number>,
  );
  for (const r of pipelineResult.rows) {
    pipeline[r.status as LeadStatus] = Number(r.cnt);
  }

  // Sources
  const totalForPercentage = total || 1;
  const sources = sourcesResult.rows.map((r) => ({
    source: String(r.source),
    count: Number(r.cnt),
    percentage: Math.round((Number(r.cnt) / totalForPercentage) * 100),
  }));

  // Trend
  const trend = trendResult.rows.map((r) => ({
    date: String(r.date),
    count: Number(r.count),
  }));

  return {
    summary: {
      total,
      newCount: Number(row.new_count),
      contactedCount: Number(row.contacted_count),
      conversionRate: total > 0 ? Math.round((Number(row.won_count) / total) * 100) : 0,
      wonCount: Number(row.won_count),
      unassignedCount: Number(row.unassigned_count),
      emailCount: Number(row.email_count),
      telegramCount: Number(row.telegram_count),
      whatsappCount: Number(row.whatsapp_count),
      totalThisMonth: Number(row.this_month),
      totalLastMonth: Number(row.last_month),
    },
    leads: recentResult.rows.map(mapLead),
    pipeline,
    sources,
    trend,
  };
}

export async function getRecentActivities(limit = 15): Promise<LeadActivity[]> {
  const db = getDb();
  const result = await db.query(
    `SELECT lead_activities.*, crm_users.name AS user_name
     FROM lead_activities
     LEFT JOIN crm_users ON crm_users.id = lead_activities.user_id
     ORDER BY lead_activities.created_at DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map(mapActivity);
}

/** Ambil daftar semua sales user untuk dropdown assign */
export async function getSalesUsers(): Promise<{ id: string; name: string }[]> {
  const db = getDb();
  const result = await db.query(
    "SELECT id, name FROM crm_users WHERE role = 'sales' ORDER BY name",
  );
  return result.rows.map((r) => ({ id: String(r.id), name: String(r.name) }));
}

/** Ambil semua leads dengan assignee name, untuk halaman listing */
export async function getAllLeads(filters?: {
  search?: string;
  company?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const db = getDb();
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters?.search) {
    conditions.push(`(l.name ILIKE '%' || $${idx} || '%' OR l.phone ILIKE '%' || $${idx} || '%' OR l.email ILIKE '%' || $${idx} || '%')`);
    values.push(filters.search);
    idx++;
  }

  if (filters?.company) {
    conditions.push(`l.company ILIKE '%' || $${idx} || '%'`);
    values.push(filters.company);
    idx++;
  }

  if (filters?.dateFrom) {
    conditions.push(`l.created_at >= $${idx}::date`);
    values.push(filters.dateFrom);
    idx++;
  }

  if (filters?.dateTo) {
    conditions.push(`l.created_at < $${idx}::date + interval '1 day'`);
    values.push(filters.dateTo);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `SELECT l.*, u.name AS assigned_name
     FROM leads l
     LEFT JOIN crm_users u ON u.id = l.assigned_to
     ${where}
     ORDER BY l.created_at DESC`,
    values,
  );
  return result.rows.map(mapLead);
}

export async function getLeadDetail(id: string) {
  const db = getDb();
  const [leadResult, activitiesResult] = await Promise.all([
    db.query("SELECT * FROM leads WHERE id = $1", [id]),
    db.query(
      `SELECT lead_activities.*, crm_users.name AS user_name
       FROM lead_activities
       LEFT JOIN crm_users ON crm_users.id = lead_activities.user_id
       WHERE lead_activities.lead_id = $1
       ORDER BY lead_activities.created_at DESC`,
      [id],
    ),
  ]);

  const lead = leadResult.rows[0] ? mapLead(leadResult.rows[0]) : null;
  return {
    lead,
    activities: activitiesResult.rows.map(mapActivity),
  };
}
