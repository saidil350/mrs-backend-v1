CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_user_role') THEN
    CREATE TYPE crm_user_role AS ENUM ('admin', 'sales');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM (
      'new',
      'contacted',
      'qualified',
      'proposal_sent',
      'won',
      'lost',
      'rejected'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE activity_type AS ENUM ('note', 'status_change', 'lead_created');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE notification_channel AS ENUM ('telegram', 'email');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'skipped');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS crm_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role crm_user_role NOT NULL DEFAULT 'sales',
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_cms_id text,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  company text,
  message text NOT NULL,
  source_page text,
  source_url text,
  status lead_status NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS legacy_cms_id text;

CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  type activity_type NOT NULL,
  body text NOT NULL,
  from_status lead_status,
  to_status lead_status,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  recipient text,
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_phone_idx ON leads(phone);
CREATE UNIQUE INDEX IF NOT EXISTS leads_legacy_cms_id_unique_idx ON leads(legacy_cms_id) WHERE legacy_cms_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lead_activities_lead_id_idx ON lead_activities(lead_id);
