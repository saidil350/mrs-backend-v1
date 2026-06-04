-- ============================================================
-- 002_cms_tables.sql
-- CMS tables for migrating away from Payload CMS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Custom ENUM for post categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_category') THEN
    CREATE TYPE post_category AS ENUM ('packaging', 'industri', 'inovasi', 'sertifikasi', 'umum');
  END IF;
END
$$;

-- ────────────────────────────────────────────────
-- MEDIA (must be first — referenced by others)
-- ────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────
-- PRODUCT CATEGORIES (before products — FK target)
-- ────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────
-- POSTS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
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

-- ────────────────────────────────────────────────
-- PROJECTS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
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

-- ────────────────────────────────────────────────
-- TESTIMONIALS
-- ────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────
-- TEAM MEMBERS
-- ────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────
-- CERTIFICATIONS
-- ────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────
-- INDUSTRIES
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  image_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  description text NOT NULL,
  expertise_summary text,
  applications text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────
-- INNOVATIONS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS innovations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  image_id uuid REFERENCES cms_media(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────
-- PRODUCTS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
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

-- ────────────────────────────────────────────────
-- PAGES
-- ────────────────────────────────────────────────
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
