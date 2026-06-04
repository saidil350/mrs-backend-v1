-- ============================================================
-- 004_cms_globals.sql
-- Create cms_globals table for brand, company & marketing data
-- Replaces Payload CMS globals (company_profile, brand_promise, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_globals (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed all 21 globals with empty data
INSERT INTO cms_globals (key, data) VALUES
  -- Brand (11)
  ('brand_essentials', '{}'),
  ('brand_story', '{}'),
  ('brand_mission', '{}'),
  ('brand_promise', '{}'),
  ('brand_pyramid', '{}'),
  ('benefit_analysis', '{}'),
  ('unique_value_proposition', '{}'),
  ('keunggulan_halgreen', '{}'),
  ('differentiating_execution', '{}'),
  ('positioning', '{}'),
  ('target_market', '{}'),
  -- Company (8)
  ('company_profile', '{}'),
  ('contact', '{}'),
  ('homepage_hero', '{}'),
  ('production_process', '{}'),
  ('site_chrome', '{}'),
  ('locations', '{}'),
  ('stats', '{}'),
  -- Marketing (2)
  ('program_mitra', '{}'),
  ('product_knowledge', '{}'),
  -- CTA / Closing (1)
  ('cta', '{}')
ON CONFLICT (key) DO NOTHING;
