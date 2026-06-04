import pg from "pg";

const pool = new pg.Pool({ connectionString: "postgresql://postgres:admin123@localhost:5432/lms_cms" });
const tempPool = new pg.Pool({ connectionString: "postgresql://postgres:admin123@localhost:5432/lms_cms_temp" });

const globals = [
  "brand_essentials", "brand_story", "brand_mission", "brand_promise",
  "brand_pyramid", "company_profile", "contact", "homepage_hero",
  "stats", "site_chrome", "locations", "production_process",
  "positioning", "target_market", "unique_value_proposition",
  "differentiating_execution", "benefit_analysis", "keunggulan_halgreen",
  "program_mitra", "product_knowledge", "cta",
];

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_globals (
      key TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  console.log("cms_globals table ready");

  for (const g of globals) {
    try {
      const r = await tempPool.query(`SELECT * FROM ${g} LIMIT 1`);
      if (r.rows.length > 0) {
        let data = { ...r.rows[0] };
        delete data.id;
        delete data.updated_at;
        delete data.created_at;

        const json = JSON.stringify(data);
        await pool.query(
          `INSERT INTO cms_globals (key, data) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = now()`,
          [g, json]
        );
        console.log(`  Migrated: ${g} (${Object.keys(data).length} fields)`);
      }
    } catch (e) {
      console.log(`  Skip: ${g} - ${e.message.substring(0, 80)}`);
    }
  }

  const result = await pool.query("SELECT key, length(data::text) as size FROM cms_globals ORDER BY key");
  console.log(`\nTotal globals: ${result.rows.length}`);
  result.rows.forEach(r => console.log(`  - ${r.key} (${r.size} chars)`));

  await pool.end();
  await tempPool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
