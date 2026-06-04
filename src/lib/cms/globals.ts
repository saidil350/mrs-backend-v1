import { getDb } from "@/lib/db";

export type CmsGlobal = {
  key: string;
  data: Record<string, unknown>;
  updatedAt: string;
};

function mapGlobal(row: Record<string, unknown>): CmsGlobal {
  return {
    key: String(row.key),
    data: (row.data as Record<string, unknown>) ?? {},
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllGlobals() {
  const result = await getDb().query(
    "SELECT * FROM cms_globals ORDER BY key",
  );
  return result.rows.map(mapGlobal);
}

export async function getGlobal(key: string) {
  const result = await getDb().query(
    "SELECT * FROM cms_globals WHERE key = $1",
    [key],
  );
  return result.rows[0] ? mapGlobal(result.rows[0]) : null;
}

export async function updateGlobal(key: string, data: Record<string, unknown>) {
  const result = await getDb().query(
    `UPDATE cms_globals SET data = $1::jsonb, updated_at = now()
     WHERE key = $2
     RETURNING *`,
    [JSON.stringify(data), key],
  );
  return result.rows[0] ? mapGlobal(result.rows[0]) : null;
}

export async function getGlobalsCounts() {
  const result = await getDb().query("SELECT count(*)::int AS c FROM cms_globals");
  return result.rows[0]?.c ?? 0;
}

// Globals metadata for sidebar & pages
export type GlobalMeta = {
  key: string;
  label: string;
  description: string;
  group: "brand" | "company" | "marketing";
};

export const GLOBALS_REGISTRY: GlobalMeta[] = [
  { key: "brand_essentials", label: "Brand Essentials", description: "Brand identity, values & positioning", group: "brand" },
  { key: "brand_story", label: "Brand Story", description: "Narrasi dan cerita brand MRS", group: "brand" },
  { key: "brand_mission", label: "Brand Mission", description: "Misi dan nilai inti", group: "brand" },
  { key: "brand_promise", label: "Brand Promise", description: "Janji brand kepada mitra", group: "brand" },
  { key: "brand_pyramid", label: "Brand Pyramid", description: "Pyramid brand hierarchy", group: "brand" },
  { key: "benefit_analysis", label: "Benefit Analysis", description: "Analisis benefit fungsional & emosional", group: "brand" },
  { key: "unique_value_proposition", label: "Unique Value Proposition", description: "UVP dan diferensiasi", group: "brand" },
  { key: "keunggulan_halgreen", label: "Keunggulan Halgreen", description: "Keunggulan produk Halgreen", group: "brand" },
  { key: "differentiating_execution", label: "Differentiating Execution", description: "Eksekusi diferensiasi MOP", group: "brand" },
  { key: "positioning", label: "Positioning", description: "Posisi brand di pasar", group: "brand" },
  { key: "target_market", label: "Target Market", description: "STP Analysis & target pasar", group: "brand" },
  { key: "company_profile", label: "Company Profile", description: "Profil perusahaan MRS", group: "company" },
  { key: "contact", label: "Contact", description: "Informasi kontak perusahaan", group: "company" },
  { key: "homepage_hero", label: "Homepage Hero", description: "Banner utama homepage", group: "company" },
  { key: "production_process", label: "Production Process", description: "Alur produksi", group: "company" },
  { key: "site_chrome", label: "Site Chrome", description: "Navigasi, footer & layout", group: "company" },
  { key: "locations", label: "Locations", description: "Lokasi kantor & pabrik", group: "company" },
  { key: "stats", label: "Stats", description: "Angka statistik perusahaan", group: "company" },
  { key: "program_mitra", label: "Program Mitra", description: "Ekosistem kemitraan", group: "marketing" },
  { key: "product_knowledge", label: "Product Knowledge", description: "Panduan pengetahuan produk", group: "marketing" },
  { key: "cta", label: "CTA / Closing", description: "Call-to-action dan closing section", group: "marketing" },
];
