import { getDb } from "@/lib/db";
import type { CmsCounts } from "@/types";

const emptyCounts: CmsCounts = {
  cms_media: 0,
  posts: 0,
  projects: 0,
  testimonials: 0,
  team_members: 0,
  certifications: 0,
  industries: 0,
  innovations: 0,
  products: 0,
  product_categories: 0,
  cms_pages: 0,
  cms_globals: 0,
};

export async function getCmsCounts(): Promise<CmsCounts> {
  try {
    const db = getDb();

    const tables = [
      "cms_media",
      "posts",
      "projects",
      "testimonials",
      "team_members",
      "certifications",
      "industries",
      "innovations",
      "products",
      "product_categories",
      "cms_pages",
      "cms_globals",
    ] as const;

    const parts = tables.map(
      (t) => `SELECT '${t}' AS tbl, count(*)::int AS cnt FROM ${t}`,
    );
    const sql = parts.join(" UNION ALL ");

    const result = await db.query(sql);

    const counts = {} as Record<string, number>;
    for (const row of result.rows) {
      counts[row.tbl] = row.cnt;
    }

    return {
      cms_media: counts["cms_media"] ?? 0,
      posts: counts["posts"] ?? 0,
      projects: counts["projects"] ?? 0,
      testimonials: counts["testimonials"] ?? 0,
      team_members: counts["team_members"] ?? 0,
      certifications: counts["certifications"] ?? 0,
      industries: counts["industries"] ?? 0,
      innovations: counts["innovations"] ?? 0,
      products: counts["products"] ?? 0,
      product_categories: counts["product_categories"] ?? 0,
      cms_pages: counts["cms_pages"] ?? 0,
      cms_globals: counts["cms_globals"] ?? 0,
    };
  } catch {
    // Tables might not exist yet (migration not run)
    return emptyCounts;
  }
}
