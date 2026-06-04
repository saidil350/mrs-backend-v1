-- ============================================================
-- 003_recreate_cms_tables.sql
-- Drop old Payload CMS tables and recreate with our schema
-- This removes Payload CMS dependency completely
-- ============================================================

-- Drop relation tables first (foreign key dependencies)
DROP TABLE IF EXISTS posts_tags CASCADE;
DROP TABLE IF EXISTS projects_gallery CASCADE;
DROP TABLE IF EXISTS projects_tags CASCADE;
DROP TABLE IF EXISTS industries_applications CASCADE;
DROP TABLE IF EXISTS innovations_tags CASCADE;
DROP TABLE IF EXISTS products_gallery CASCADE;
DROP TABLE IF EXISTS products_specifications CASCADE;

-- Drop old Payload tables that conflict with our new schema
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS innovations CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS team CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS media CASCADE;

-- Drop old Payload system tables (no longer needed)
DROP TABLE IF EXISTS payload_migrations CASCADE;
DROP TABLE IF EXISTS payload_preferences CASCADE;
DROP TABLE IF EXISTS payload_preferences_rels CASCADE;
DROP TABLE IF EXISTS payload_locked_documents CASCADE;
DROP TABLE IF EXISTS payload_locked_documents_rels CASCADE;
DROP TABLE IF EXISTS payload_kv CASCADE;
DROP TABLE IF EXISTS users_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old Payload globals tables
DROP TABLE IF EXISTS benefit_analysis CASCADE;
DROP TABLE IF EXISTS benefit_analysis_emotional_benefits CASCADE;
DROP TABLE IF EXISTS benefit_analysis_functional_benefits CASCADE;
DROP TABLE IF EXISTS brand_essentials CASCADE;
DROP TABLE IF EXISTS brand_essentials_core_values CASCADE;
DROP TABLE IF EXISTS brand_essentials_stp_positioning CASCADE;
DROP TABLE IF EXISTS brand_essentials_stp_segmentation CASCADE;
DROP TABLE IF EXISTS brand_essentials_stp_targeting CASCADE;
DROP TABLE IF EXISTS brand_mission CASCADE;
DROP TABLE IF EXISTS brand_mission_core_values CASCADE;
DROP TABLE IF EXISTS brand_promise CASCADE;
DROP TABLE IF EXISTS brand_promise_items CASCADE;
DROP TABLE IF EXISTS brand_promise_vision_points CASCADE;
DROP TABLE IF EXISTS brand_pyramid CASCADE;
DROP TABLE IF EXISTS brand_pyramid_levels CASCADE;
DROP TABLE IF EXISTS brand_story CASCADE;
DROP TABLE IF EXISTS brand_story_uvp_points CASCADE;
DROP TABLE IF EXISTS company_profile CASCADE;
DROP TABLE IF EXISTS company_profile_overview_highlights CASCADE;
DROP TABLE IF EXISTS company_profile_social_links CASCADE;
DROP TABLE IF EXISTS contact CASCADE;
DROP TABLE IF EXISTS cta CASCADE;
DROP TABLE IF EXISTS differentiating_execution CASCADE;
DROP TABLE IF EXISTS differentiating_execution_mop_items CASCADE;
DROP TABLE IF EXISTS differentiating_execution_standars CASCADE;
DROP TABLE IF EXISTS homepage_hero CASCADE;
DROP TABLE IF EXISTS homepage_hero_support_images CASCADE;
DROP TABLE IF EXISTS keunggulan_halgreen CASCADE;
DROP TABLE IF EXISTS keunggulan_halgreen_emotional_benefits CASCADE;
DROP TABLE IF EXISTS keunggulan_halgreen_functional_benefits CASCADE;
DROP TABLE IF EXISTS keunggulan_halgreen_pyramid_levels CASCADE;
DROP TABLE IF EXISTS keunggulan_halgreen_standar_points CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS locations_locations CASCADE;
DROP TABLE IF EXISTS positioning CASCADE;
DROP TABLE IF EXISTS positioning_elements CASCADE;
DROP TABLE IF EXISTS positioning_reasons_to_believe CASCADE;
DROP TABLE IF EXISTS production_process CASCADE;
DROP TABLE IF EXISTS production_process_stages CASCADE;
DROP TABLE IF EXISTS product_knowledge CASCADE;
DROP TABLE IF EXISTS product_knowledge_topics CASCADE;
DROP TABLE IF EXISTS program_mitra CASCADE;
DROP TABLE IF EXISTS program_mitra_faqs CASCADE;
DROP TABLE IF EXISTS program_mitra_steps CASCADE;
DROP TABLE IF EXISTS program_mitra_value_points CASCADE;
DROP TABLE IF EXISTS site_chrome CASCADE;
DROP TABLE IF EXISTS site_chrome_footer_groups CASCADE;
DROP TABLE IF EXISTS site_chrome_footer_groups_links CASCADE;
DROP TABLE IF EXISTS site_chrome_legal_links CASCADE;
DROP TABLE IF EXISTS site_chrome_navigation_items CASCADE;
DROP TABLE IF EXISTS site_chrome_navigation_items_mega_menu_groups CASCADE;
DROP TABLE IF EXISTS site_chrome_navigation_items_mega_menu_groups_links CASCADE;
DROP TABLE IF EXISTS stats CASCADE;
DROP TABLE IF EXISTS stats_items CASCADE;
DROP TABLE IF EXISTS target_market CASCADE;
DROP TABLE IF EXISTS target_market_positioning_items CASCADE;
DROP TABLE IF EXISTS target_market_segmentation_items CASCADE;
DROP TABLE IF EXISTS target_market_targeting_items CASCADE;
DROP TABLE IF EXISTS unique_value_proposition CASCADE;
DROP TABLE IF EXISTS unique_value_proposition_uvp_points CASCADE;

-- Now recreate our CMS tables with proper schema
-- (002_cms_tables.sql will be run again, but CREATE IF NOT EXISTS
--  will now actually create them since we dropped the old ones)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_category') THEN
    CREATE TYPE post_category AS ENUM ('packaging', 'industri', 'inovasi', 'sertifikasi', 'umum');
  END IF;
END
$$;

-- ─── MEDIA ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alt text NOT NULL,
  caption text,
  filename text NOT NULL,
  mime_type text NOT NULL,
  filesize integer,
  width integer,
  height integer,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS cms_media_filename_idx ON cms_media(filename);

-- ─── PRODUCT CATEGORIES ───────────────────────────
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 100,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── POSTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  thumbnail_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  category post_category NOT NULL DEFAULT 'umum',
  content jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  author text NOT NULL DEFAULT 'Tim Redaksi',
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  seo_meta_title text,
  seo_meta_description text,
  seo_og_image_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(is_published) WHERE is_published = true;

-- ─── PROJECTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  gallery jsonb NOT NULL DEFAULT '[]',
  category text,
  client text,
  year integer,
  tags text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_slug_idx ON projects(slug);

-- ─── TESTIMONIALS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  role text,
  quote text NOT NULL,
  avatar_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── TEAM MEMBERS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  photo_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  linkedin_url text,
  email text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── CERTIFICATIONS ──────────────────────────────
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL,
  logo_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  year integer,
  description text,
  document_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── INDUSTRIES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  image_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  description text NOT NULL DEFAULT '',
  expertise_summary text,
  applications text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── INNOVATIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS innovations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text,
  image_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── PRODUCTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  description jsonb,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  gallery jsonb NOT NULL DEFAULT '[]',
  specifications jsonb NOT NULL DEFAULT '[]',
  pricing_info text,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  is_published boolean NOT NULL DEFAULT false,
  seo_meta_title text,
  seo_meta_description text,
  seo_og_image_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);

-- ─── PAGES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content jsonb,
  is_published boolean NOT NULL DEFAULT false,
  seo_meta_title text,
  seo_meta_description text,
  seo_og_image_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cms_pages_slug_idx ON cms_pages(slug);
