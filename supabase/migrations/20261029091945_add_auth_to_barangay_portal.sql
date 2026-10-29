/*
# Barangay Lumangbayan Portal — Add Auth & Admin/Resident Roles

This migration adds authentication support to the existing portal schema.
It creates a profiles table, adds user_id and admin columns to existing tables,
and updates RLS policies for admin/resident role-based access.

## Changes to Existing Tables

1. **announcements** — Add `created_by` column (uuid, references auth.users)
2. **service_requests** — Add `user_id`, `updated_at`, `admin_notes` columns
3. **blotter_reports** — Add `user_id`, `admin_notes` columns

## New Tables

1. **profiles** — Extends auth.users with role (admin/resident), full_name, phone, address

## New Functions

1. **is_admin(uuid)** — SECURITY DEFINER function to check if a user is an admin

## Security Changes

- All policies rewritten for role-based access
- Public read stays for announcements, services, officials
- Admin-only writes for announcements, services, officials
- Resident-scoped reads for service_requests, blotter_reports (own data only)
- Admin can read all and update status on requests/reports
*/

-- ============ PROFILES TABLE ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'resident' CHECK (role IN ('admin', 'resident')),
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON profiles TO authenticated;

-- is_admin helper function (SECURITY DEFINER so it can read profiles bypassing RLS)
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;

-- Profile policies
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (is_admin());

-- ============ ADD COLUMNS TO EXISTING TABLES ============

-- announcements: add created_by
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'created_by') THEN
    ALTER TABLE announcements ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- service_requests: add user_id, updated_at, admin_notes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'user_id') THEN
    ALTER TABLE service_requests ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'updated_at') THEN
    ALTER TABLE service_requests ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'admin_notes') THEN
    ALTER TABLE service_requests ADD COLUMN admin_notes text;
  END IF;
END $$;

-- blotter_reports: add user_id, admin_notes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blotter_reports' AND column_name = 'user_id') THEN
    ALTER TABLE blotter_reports ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blotter_reports' AND column_name = 'admin_notes') THEN
    ALTER TABLE blotter_reports ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Update status constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'service_requests_status_check' AND table_name = 'service_requests') THEN
    ALTER TABLE service_requests ADD CONSTRAINT service_requests_status_check
      CHECK (status IN ('Pending', 'Processing', 'Ready for Pickup', 'Completed', 'Rejected'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'blotter_reports_status_check' AND table_name = 'blotter_reports') THEN
    ALTER TABLE blotter_reports ADD CONSTRAINT blotter_reports_status_check
      CHECK (status IN ('Filed', 'Under Investigation', 'Resolved', 'Dismissed'));
  END IF;
END $$;

-- ============ ANNOUNCEMENTS — Update Policies ============
-- Drop old policies
DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
DROP POLICY IF EXISTS "anon_insert_announcements" ON announcements;
DROP POLICY IF EXISTS "anon_update_announcements" ON announcements;
DROP POLICY IF EXISTS "anon_delete_announcements" ON announcements;
DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
DROP POLICY IF EXISTS "admin_insert_announcements" ON announcements;
DROP POLICY IF EXISTS "admin_update_announcements" ON announcements;
DROP POLICY IF EXISTS "admin_delete_announcements" ON announcements;

-- Grant: public read, admin write
GRANT SELECT ON announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON announcements TO authenticated;

-- Public read
CREATE POLICY "public_read_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);

-- Admin-only writes
CREATE POLICY "admin_insert_announcements" ON announcements FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "admin_update_announcements" ON announcements FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_delete_announcements" ON announcements FOR DELETE
  TO authenticated USING (is_admin());

-- ============ SERVICES — Update Policies ============
DROP POLICY IF EXISTS "anon_select_services" ON services;
DROP POLICY IF EXISTS "anon_insert_services" ON services;
DROP POLICY IF EXISTS "anon_update_services" ON services;
DROP POLICY IF EXISTS "anon_delete_services" ON services;
DROP POLICY IF EXISTS "public_read_services" ON services;
DROP POLICY IF EXISTS "admin_insert_services" ON services;
DROP POLICY IF EXISTS "admin_update_services" ON services;
DROP POLICY IF EXISTS "admin_delete_services" ON services;

GRANT SELECT ON services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON services TO authenticated;

CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "admin_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "admin_update_services" ON services FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_delete_services" ON services FOR DELETE
  TO authenticated USING (is_admin());

-- ============ OFFICIALS — Update Policies ============
DROP POLICY IF EXISTS "anon_select_officials" ON officials;
DROP POLICY IF EXISTS "anon_insert_officials" ON officials;
DROP POLICY IF EXISTS "anon_update_officials" ON officials;
DROP POLICY IF EXISTS "anon_delete_officials" ON officials;
DROP POLICY IF EXISTS "public_read_officials" ON officials;
DROP POLICY IF EXISTS "admin_insert_officials" ON officials;
DROP POLICY IF EXISTS "admin_update_officials" ON officials;
DROP POLICY IF EXISTS "admin_delete_officials" ON officials;

GRANT SELECT ON officials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON officials TO authenticated;

CREATE POLICY "public_read_officials" ON officials FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "admin_insert_officials" ON officials FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "admin_update_officials" ON officials FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_delete_officials" ON officials FOR DELETE
  TO authenticated USING (is_admin());

-- ============ SERVICE_REQUESTS — Update Policies ============
DROP POLICY IF EXISTS "anon_select_service_requests" ON service_requests;
DROP POLICY IF EXISTS "anon_insert_service_requests" ON service_requests;
DROP POLICY IF EXISTS "anon_update_service_requests" ON service_requests;
DROP POLICY IF EXISTS "anon_delete_service_requests" ON service_requests;
DROP POLICY IF EXISTS "select_service_requests" ON service_requests;
DROP POLICY IF EXISTS "insert_own_service_requests" ON service_requests;
DROP POLICY IF EXISTS "update_service_requests" ON service_requests;

GRANT SELECT, INSERT, UPDATE ON service_requests TO authenticated;

-- Residents see their own; admins see all
CREATE POLICY "select_service_requests" ON service_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- Residents insert their own
CREATE POLICY "insert_own_service_requests" ON service_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Residents update own (e.g. cancel); admins update any (status, notes)
CREATE POLICY "update_service_requests" ON service_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_admin()) WITH CHECK (auth.uid() = user_id OR is_admin());

-- ============ BLOTTER_REPORTS — Update Policies ============
DROP POLICY IF EXISTS "anon_select_blotter_reports" ON blotter_reports;
DROP POLICY IF EXISTS "anon_insert_blotter_reports" ON blotter_reports;
DROP POLICY IF EXISTS "anon_update_blotter_reports" ON blotter_reports;
DROP POLICY IF EXISTS "anon_delete_blotter_reports" ON blotter_reports;
DROP POLICY IF EXISTS "select_blotter_reports" ON blotter_reports;
DROP POLICY IF EXISTS "insert_own_blotter_reports" ON blotter_reports;
DROP POLICY IF EXISTS "update_blotter_reports" ON blotter_reports;

GRANT SELECT, INSERT, UPDATE ON blotter_reports TO authenticated;

-- Residents see their own; admins see all
CREATE POLICY "select_blotter_reports" ON blotter_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- Residents insert their own
CREATE POLICY "insert_own_blotter_reports" ON blotter_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admins update any (status, notes); residents can update own
CREATE POLICY "update_blotter_reports" ON blotter_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_admin()) WITH CHECK (auth.uid() = user_id OR is_admin());

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_announcements_pinned_date ON announcements (is_pinned DESC, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_user ON service_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests (status);
CREATE INDEX IF NOT EXISTS idx_blotter_reports_user ON blotter_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_blotter_reports_status ON blotter_reports (status);
CREATE INDEX IF NOT EXISTS idx_officials_order ON officials (display_order);
