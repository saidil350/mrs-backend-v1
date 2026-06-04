import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new pg.Pool({ connectionString });

async function migrate() {
  console.log("=== Step 1: Rename old Payload tables ===");
  const oldTables = [
    "posts", "projects", "testimonials", "certifications",
    "industries", "innovations", "products", "product_categories",
    "media",
  ];

  for (const t of oldTables) {
    // Check if old table exists and has the integer id (Payload schema)
    const check = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'id' AND data_type = 'integer'`,
      [t],
    );
    if (check.rows.length > 0) {
      await pool.query(`DROP TABLE IF EXISTS old_${t} CASCADE`);
      await pool.query(`ALTER TABLE ${t} RENAME TO old_${t}`);
      console.log(`  Renamed ${t} → old_${t}`);
    } else {
      console.log(`  Skipped ${t} (already new schema or doesn't exist)`);
    }
  }

  // Handle team (Payload used 'team', we use 'team_members')
  const teamCheck = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'team' AND column_name = 'id' AND data_type = 'integer'`,
  );
  if (teamCheck.rows.length > 0) {
    await pool.query(`DROP TABLE IF EXISTS old_team CASCADE`);
    await pool.query(`ALTER TABLE team RENAME TO old_team`);
    console.log("  Renamed team → old_team");
  }

  // Handle pages (Payload used 'pages', we use 'cms_pages')
  const pagesCheck = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'id' AND data_type = 'integer'`,
  );
  if (pagesCheck.rows.length > 0) {
    await pool.query(`DROP TABLE IF EXISTS old_pages CASCADE`);
    await pool.query(`ALTER TABLE pages RENAME TO old_pages`);
    console.log("  Renamed pages → old_pages");
  }

  // Drop old Payload relation/junction tables
  const junkTables = [
    "posts_tags", "projects_gallery", "projects_tags",
    "industries_applications", "innovations_tags",
    "products_gallery", "products_specifications",
    "payload_migrations", "payload_preferences", "payload_preferences_rels",
    "payload_locked_documents", "payload_locked_documents_rels", "payload_kv",
    "users_sessions", "users",
    "benefit_analysis", "benefit_analysis_emotional_benefits", "benefit_analysis_functional_benefits",
    "brand_essentials", "brand_essentials_core_values", "brand_essentials_stp_positioning",
    "brand_essentials_stp_segmentation", "brand_essentials_stp_targeting",
    "brand_mission", "brand_mission_core_values",
    "brand_promise", "brand_promise_items", "brand_promise_vision_points",
    "brand_pyramid", "brand_pyramid_levels",
    "brand_story", "brand_story_uvp_points",
    "company_profile", "company_profile_overview_highlights", "company_profile_social_links",
    "contact", "cta",
    "differentiating_execution", "differentiating_execution_mop_items", "differentiating_execution_standars",
    "homepage_hero", "homepage_hero_support_images",
    "keunggulan_halgreen", "keunggulan_halgreen_emotional_benefits",
    "keunggulan_halgreen_functional_benefits", "keunggulan_halgreen_pyramid_levels", "keunggulan_halgreen_standar_points",
    "locations", "locations_locations",
    "positioning", "positioning_elements", "positioning_reasons_to_believe",
    "production_process", "production_process_stages",
    "product_knowledge", "product_knowledge_topics",
    "program_mitra", "program_mitra_faqs", "program_mitra_steps", "program_mitra_value_points",
    "site_chrome", "site_chrome_footer_groups", "site_chrome_footer_groups_links",
    "site_chrome_legal_links", "site_chrome_navigation_items", "site_chrome_navigation_items_mega_menu_groups",
    "site_chrome_navigation_items_mega_menu_groups_links",
    "stats", "stats_items",
    "target_market", "target_market_positioning_items", "target_market_segmentation_items", "target_market_targeting_items",
    "unique_value_proposition", "unique_value_proposition_uvp_points",
  ];

  for (const jt of junkTables) {
    await pool.query(`DROP TABLE IF EXISTS ${jt} CASCADE`);
  }
  console.log(`  Dropped ${junkTables.length} old Payload tables`);

  console.log("\n=== Step 2: Create new CMS tables ===");
  const migrationSql = await readFile(join(root, "migrations", "002_cms_tables.sql"), "utf8");
  await pool.query(migrationSql);
  console.log("  New CMS tables created");

  console.log("\n=== Step 3: Migrate data ===");

  // Helper: get tags from junction table
  async function getTags(tableName) {
    try {
      const result = await pool.query(`SELECT * FROM old_${tableName}`);
      const map = {};
      for (const row of result.rows) {
        const id = row.id || row.post_id || row.project_id || row.innovation_id;
        if (!map[id]) map[id] = [];
        map[id].push(row.tag || row.text || row.name || "");
      }
      return map;
    } catch {
      return {}; // table doesn't exist — return empty map
    }
  }

  // --- Migrate media ---
  const mediaResult = await pool.query("SELECT * FROM old_media");
  const mediaIdMap = {}; // old int id → new uuid
  for (const row of mediaResult.rows) {
    const newId = (await pool.query(
      `INSERT INTO cms_media (alt, caption, filename, mime_type, filesize, url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        row.alt || "Untitled",
        row.caption || null,
        row.filename || `file-${row.id}`,
        row.mime_type || "image/jpeg",
        row.filesize || null,
        row.url || `/media/${row.filename || row.id}`,
      ],
    )).rows[0].id;
    mediaIdMap[row.id] = newId;
  }
  console.log(`  Media: ${mediaResult.rows.length} rows migrated`);

  // --- Migrate product_categories ---
  const pcResult = await pool.query("SELECT * FROM old_product_categories");
  const pcIdMap = {};
  for (const row of pcResult.rows) {
    const newId = (await pool.query(
      `INSERT INTO product_categories (name, slug, description, icon, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [row.name, row.slug, row.description, row.icon, Number(row.order || 100), row.is_published ?? false],
    )).rows[0].id;
    pcIdMap[row.id] = newId;
  }
  console.log(`  Product Categories: ${pcResult.rows.length} rows migrated`);

  // --- Migrate posts ---
  const postsTags = await getTags("posts_tags");
  const postsResult = await pool.query("SELECT * FROM old_posts");
  for (const row of postsResult.rows) {
    await pool.query(
      `INSERT INTO posts (title, slug, excerpt, thumbnail_id, category, content, tags, author, published_at, is_published, seo_meta_title, seo_meta_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        row.title,
        row.slug,
        row.excerpt || "",
        row.thumbnail_id ? (mediaIdMap[row.thumbnail_id] || null) : null,
        row.category || "umum",
        row.content ? JSON.stringify(row.content) : null,
        postsTags[row.id] || [],
        row.author || "Tim Redaksi",
        row.published_at,
        row.is_published ?? false,
        row.seo_meta_title,
        row.seo_meta_description,
      ],
    );
  }
  console.log(`  Posts: ${postsResult.rows.length} rows migrated`);

  // --- Migrate projects ---
  const projectsTags = await getTags("projects_tags");
  let projectsGallery = {};
  try {
    const pgRows = await pool.query("SELECT * FROM old_projects_gallery");
    for (const r of pgRows.rows) {
      if (!projectsGallery[r.project_id]) projectsGallery[r.project_id] = [];
      projectsGallery[r.project_id].push({
        imageId: String(mediaIdMap[r.image_id] || r.image_id || ""),
        caption: r.caption || "",
      });
    }
  } catch { /* table might not exist */ }

  const projectsResult = await pool.query("SELECT * FROM old_projects");
  for (const row of projectsResult.rows) {
    await pool.query(
      `INSERT INTO projects (title, slug, description, image_id, gallery, category, client, year, tags, is_published, sort_order)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11)`,
      [
        row.title,
        row.slug,
        row.description || "",
        row.image_id ? (mediaIdMap[row.image_id] || null) : null,
        JSON.stringify(projectsGallery[row.id] || []),
        row.category,
        row.client,
        row.year ? Number(row.year) : null,
        projectsTags[row.id] || [],
        row.is_published ?? true,
        Number(row.order || 0),
      ],
    );
  }
  console.log(`  Projects: ${projectsResult.rows.length} rows migrated`);

  // --- Migrate testimonials ---
  const testResult = await pool.query("SELECT * FROM old_testimonials");
  for (const row of testResult.rows) {
    await pool.query(
      `INSERT INTO testimonials (name, company, role, quote, avatar_id, rating, is_published, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        row.name,
        row.company,
        row.role,
        row.quote,
        row.avatar_id ? (mediaIdMap[row.avatar_id] || null) : null,
        row.rating ? Number(row.rating) : null,
        row.is_published ?? true,
        Number(row.order || 0),
      ],
    );
  }
  console.log(`  Testimonials: ${testResult.rows.length} rows migrated`);

  // --- Migrate certifications ---
  const certResult = await pool.query("SELECT * FROM old_certifications");
  for (const row of certResult.rows) {
    await pool.query(
      `INSERT INTO certifications (name, issuer, logo_id, year, description, document_url, is_published, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        row.name,
        row.issuer,
        row.logo_id ? (mediaIdMap[row.logo_id] || null) : null,
        row.year ? Number(row.year) : null,
        row.description,
        row.document_url,
        row.is_published ?? true,
        Number(row.order || 0),
      ],
    );
  }
  console.log(`  Certifications: ${certResult.rows.length} rows migrated`);

  // --- Migrate industries ---
  let industriesApps = {};
  try {
    const iaRows = await pool.query("SELECT * FROM old_industries_applications");
    for (const r of iaRows.rows) {
      if (!industriesApps[r.industry_id]) industriesApps[r.industry_id] = [];
      industriesApps[r.industry_id].push(r.text || r.application || "");
    }
  } catch { /* table might not exist */ }

  const indResult = await pool.query("SELECT * FROM old_industries");
  for (const row of indResult.rows) {
    await pool.query(
      `INSERT INTO industries (name, icon, image_id, description, expertise_summary, applications, is_published, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        row.name,
        row.icon,
        row.image_id ? (mediaIdMap[row.image_id] || null) : null,
        row.description || "",
        row.expertise_summary,
        industriesApps[row.id] || [],
        row.is_published ?? true,
        Number(row.order || 0),
      ],
    );
  }
  console.log(`  Industries: ${indResult.rows.length} rows migrated`);

  // --- Migrate innovations ---
  const innovTags = await getTags("innovations_tags");
  const innovResult = await pool.query("SELECT * FROM old_innovations");
  for (const row of innovResult.rows) {
    await pool.query(
      `INSERT INTO innovations (title, description, icon, image_id, tags, is_published, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        row.title,
        row.description || "",
        row.icon,
        row.image_id ? (mediaIdMap[row.image_id] || null) : null,
        innovTags[row.id] || [],
        row.is_published ?? true,
        Number(row.order || 0),
      ],
    );
  }
  console.log(`  Innovations: ${innovResult.rows.length} rows migrated`);

  // --- Migrate products ---
  let productsGallery = {};
  let productsSpecs = {};
  try {
    const pgRows = await pool.query("SELECT * FROM old_products_gallery");
    for (const r of pgRows.rows) {
      if (!productsGallery[r.product_id]) productsGallery[r.product_id] = [];
      productsGallery[r.product_id].push({
        imageId: String(mediaIdMap[r.image_id] || r.image_id || ""),
        caption: r.caption || "",
      });
    }
  } catch { /* ignore */ }
  try {
    const psRows = await pool.query("SELECT * FROM old_products_specifications");
    for (const r of psRows.rows) {
      if (!productsSpecs[r.product_id]) productsSpecs[r.product_id] = [];
      productsSpecs[r.product_id].push({ label: r.label || "", value: r.value || "" });
    }
  } catch { /* ignore */ }

  const prodResult = await pool.query("SELECT * FROM old_products");
  for (const row of prodResult.rows) {
    await pool.query(
      `INSERT INTO products (name, slug, excerpt, description, category_id, gallery, specifications, pricing_info, featured, sort_order, is_published, seo_meta_title, seo_meta_description)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11, $12, $13)`,
      [
        row.name,
        row.slug,
        row.excerpt || "",
        row.description ? JSON.stringify(row.description) : null,
        row.category_id ? (pcIdMap[row.category_id] || null) : null,
        JSON.stringify(productsGallery[row.id] || []),
        JSON.stringify(productsSpecs[row.id] || []),
        row.pricing_info,
        row.featured ?? false,
        Number(row.order || 100),
        row.is_published ?? false,
        row.seo_meta_title,
        row.seo_meta_description,
      ],
    );
  }
  console.log(`  Products: ${prodResult.rows.length} rows migrated`);

  // --- Migrate pages ---
  let pagesMigrated = 0;
  try {
    const pagesResult = await pool.query("SELECT * FROM old_pages");
    for (const row of pagesResult.rows) {
      await pool.query(
        `INSERT INTO cms_pages (title, slug, excerpt, content, is_published, seo_meta_title, seo_meta_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          row.title,
          row.slug,
          row.excerpt,
          row.content ? JSON.stringify(row.content) : null,
          row.is_published ?? false,
          row.seo_meta_title,
          row.seo_meta_description,
        ],
      );
      pagesMigrated++;
    }
  } catch (e) {
    console.log(`  Pages: skipped (${e.message})`);
  }
  if (pagesMigrated) console.log(`  Pages: ${pagesMigrated} rows migrated`);

  // --- Migrate team (old table name: 'team') ---
  let teamMigrated = 0;
  try {
    const teamResult = await pool.query("SELECT * FROM old_team");
    for (const row of teamResult.rows) {
      await pool.query(
        `INSERT INTO team_members (name, role, bio, photo_id, linkedin_url, email, is_published, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          row.name,
          row.role,
          row.bio,
          row.photo_id ? (mediaIdMap[row.photo_id] || null) : null,
          row.linkedin_url || row.linkedin,
          row.email,
          row.is_published ?? true,
          Number(row.order || 0),
        ],
      );
      teamMigrated++;
    }
  } catch (e) {
    console.log(`  Team: skipped (${e.message})`);
  }
  if (teamMigrated) console.log(`  Team: ${teamMigrated} rows migrated`);

  console.log("\n=== Step 4: Drop old tables ===");
  const allOld = [
    "old_posts", "old_projects", "old_testimonials", "old_certifications",
    "old_industries", "old_innovations", "old_products", "old_product_categories",
    "old_media", "old_team", "old_pages",
    "old_posts_tags", "old_projects_gallery", "old_projects_tags",
    "old_industries_applications", "old_innovations_tags",
    "old_products_gallery", "old_products_specifications",
  ];
  for (const t of allOld) {
    await pool.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
  }
  console.log("  All old tables dropped");

  console.log("\n=== Migration complete! ===");
}

migrate()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Migration failed:", err);
    pool.end();
    process.exit(1);
  });
