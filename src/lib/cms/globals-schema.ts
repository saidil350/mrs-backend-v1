// Field schema definitions for each global
// This drives the dynamic form renderer

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "image"
  | "array"
  | "group";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  fields?: FieldDef[];       // for "group"
  itemFields?: FieldDef[];   // for "array" items
  placeholder?: string;
};

export type GlobalSchema = {
  key: string;
  label: string;
  description: string;
  group: "brand" | "company" | "marketing";
  fields: FieldDef[];
};

// Helper to quickly define fields
const t = (key: string, label: string, type: FieldType, extra?: Partial<FieldDef>): FieldDef => ({
  key, label, type, ...extra,
});

export const GLOBALS_SCHEMAS: GlobalSchema[] = [
  {
    key: "brand_essentials",
    label: "Brand Essentials",
    description: "Brand identity, values & positioning",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("subheadline", "Subheadline", "text"),
    ],
  },
  {
    key: "brand_story",
    label: "Brand Story",
    description: "Narasi dan cerita brand MRS",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("kenapa_m_r_s", "Kenapa MRS?", "textarea"),
      t("sejarah_singkat", "Sejarah Singkat", "textarea"),
      t("visi_masa_depan", "Visi Masa Depan", "textarea"),
      t("filosofi_brand", "Filosofi Brand", "textarea"),
      t("closing_statement", "Closing Statement", "textarea"),
    ],
  },
  {
    key: "brand_mission",
    label: "Brand Mission",
    description: "Misi dan nilai inti",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("mission_text", "Mission Text", "textarea"),
    ],
  },
  {
    key: "brand_promise",
    label: "Brand Promise",
    description: "Janji brand kepada mitra",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("subheadline", "Subheadline", "textarea"),
      t("description", "Description", "textarea"),
    ],
  },
  {
    key: "brand_pyramid",
    label: "Brand Pyramid",
    description: "Pyramid brand hierarchy",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("subheadline", "Subheadline", "text"),
    ],
  },
  {
    key: "benefit_analysis",
    label: "Benefit Analysis",
    description: "Analisis benefit fungsional & emosional",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("functional_benefits_title", "Functional Benefits Title", "text"),
      t("emotional_benefits_title", "Emotional Benefits Title", "text"),
    ],
  },
  {
    key: "unique_value_proposition",
    label: "Unique Value Proposition",
    description: "UVP dan diferensiasi",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("quote_statement", "Quote Statement", "textarea"),
      t("explanation", "Explanation", "textarea"),
    ],
  },
  {
    key: "keunggulan_halgreen",
    label: "Keunggulan Halgreen",
    description: "Keunggulan produk Halgreen",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("subheadline", "Subheadline", "text"),
      t("description", "Description", "textarea"),
      t("tagline", "Tagline", "text"),
    ],
  },
  {
    key: "differentiating_execution",
    label: "Differentiating Execution",
    description: "Eksekusi diferensiasi MOP",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("subheadline", "Subheadline", "text"),
      t("description", "Description", "textarea"),
    ],
  },
  {
    key: "positioning",
    label: "Positioning",
    description: "Posisi brand di pasar",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
    ],
  },
  {
    key: "target_market",
    label: "Target Market",
    description: "STP Analysis & target pasar",
    group: "brand",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("cta_label", "CTA Label", "text"),
      t("cta_href", "CTA Link", "text"),
    ],
  },
  {
    key: "company_profile",
    label: "Company Profile",
    description: "Profil perusahaan MRS",
    group: "company",
    fields: [
      t("site_name", "Nama Perusahaan", "text"),
      t("tagline", "Tagline", "text"),
      t("description", "Deskripsi", "textarea"),
      t("founded_year", "Tahun Berdiri", "text"),
      t("legal_name", "Nama Legal", "text"),
      t("npwp", "NPWP", "text"),
      t("email", "Email", "text"),
      t("phone", "Telepon", "text"),
      t("address", "Alamat", "textarea"),
      t("city", "Kota", "text"),
      t("province", "Provinsi", "text"),
      t("country", "Negara", "text"),
      t("postal_code", "Kode Pos", "text"),
      t("website", "Website", "text"),
      t("google_maps_link", "Google Maps Link", "text"),
      t("meta_title", "Meta Title", "text"),
      t("meta_description", "Meta Description", "textarea"),
      t("og_title", "OG Title", "text"),
      t("og_description", "OG Description", "textarea"),
    ],
  },
  {
    key: "contact",
    label: "Contact",
    description: "Informasi kontak perusahaan",
    group: "company",
    fields: [
      t("section_headline", "Section Headline", "text"),
      t("section_description", "Section Description", "textarea"),
      t("email", "Email", "text"),
      t("phone", "Telepon", "text"),
      t("whatsapp", "WhatsApp", "text"),
      t("address", "Alamat", "textarea"),
      t("working_hours", "Jam Kerja", "text"),
      t("google_maps_embed_url", "Google Maps Embed URL", "text"),
      t("form_title", "Form Title", "text"),
      t("form_description", "Form Description", "text"),
      t("cta_button_label", "CTA Button Label", "text"),
    ],
  },
  {
    key: "homepage_hero",
    label: "Homepage Hero",
    description: "Banner utama homepage",
    group: "company",
    fields: [
      t("title_primary", "Title Primary", "text"),
      t("title_secondary", "Title Secondary", "text"),
      t("description", "Description", "textarea"),
      t("cta_label", "CTA Label", "text"),
      t("cta_href", "CTA Link", "text"),
      t("media_type", "Media Type", "text"),
      t("background_overlay_opacity", "Overlay Opacity", "text"),
    ],
  },
  {
    key: "production_process",
    label: "Production Process",
    description: "Alur produksi",
    group: "company",
    fields: [
      t("headline", "Headline", "text"),
      t("intro_description", "Intro Description", "textarea"),
    ],
  },
  {
    key: "site_chrome",
    label: "Site Chrome",
    description: "Navigasi, footer & layout",
    group: "company",
    fields: [
      t("header_cta_label", "Header CTA Label", "text"),
      t("header_cta_href", "Header CTA Link", "text"),
      t("footer_description", "Footer Description", "textarea"),
    ],
  },
  {
    key: "locations",
    label: "Locations",
    description: "Lokasi kantor & pabrik",
    group: "company",
    fields: [],
  },
  {
    key: "stats",
    label: "Stats",
    description: "Angka statistik perusahaan",
    group: "company",
    fields: [],
  },
  {
    key: "program_mitra",
    label: "Program Mitra",
    description: "Ekosistem kemitraan",
    group: "marketing",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("subheadline", "Subheadline", "text"),
      t("intro_text", "Intro Text", "textarea"),
      t("benefit_headline", "Benefit Headline", "text"),
      t("process_headline", "Process Headline", "text"),
      t("faq_headline", "FAQ Headline", "text"),
      t("cta_label", "CTA Label", "text"),
      t("cta_href", "CTA Link", "text"),
    ],
  },
  {
    key: "product_knowledge",
    label: "Product Knowledge",
    description: "Panduan pengetahuan produk",
    group: "marketing",
    fields: [
      t("eyebrow", "Eyebrow", "text"),
      t("headline", "Headline", "text"),
      t("subheadline", "Subheadline", "text"),
      t("intro_text", "Intro Text", "textarea"),
      t("cta_label", "CTA Label", "text"),
      t("cta_href", "CTA Link", "text"),
    ],
  },
  {
    key: "cta",
    label: "CTA / Closing",
    description: "Call-to-action dan closing section",
    group: "marketing",
    fields: [
      t("headline", "Headline", "text"),
      t("body_text", "Body Text", "textarea"),
      t("footer_text", "Footer Text", "text"),
    ],
  },
];

export function getSchema(key: string): GlobalSchema | undefined {
  return GLOBALS_SCHEMAS.find((s) => s.key === key);
}
