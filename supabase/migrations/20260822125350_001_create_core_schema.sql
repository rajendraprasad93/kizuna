/*
# City Problem Intelligence System - Core Schema

## Overview
Creates the database schema for an Agentic AI-Powered City Problem Intelligence System.
Citizens report problems (flooding, potholes, garbage), an AI engine analyzes them,
and department officials resolve them. Admins oversee the platform.

## New Tables
1. profiles - Extends auth.users with role (citizen/department/admin), full_name, department link, phone
2. departments - City departments (Drainage, Roads, Sanitation, Emergency Services)
3. problem_categories - Problem types (flooding, pothole, garbage) with icon, color, priority, SLA
4. reports - Citizen problem reports with location, status, AI analysis link, images
5. ai_analyses - AI analysis results: detected problem, confidence, root causes, recommendations, verification
6. actions_taken - Records of actions performed by officials on reports
7. notifications - User notifications for status updates

## Security
- All tables have RLS enabled
- profiles: users can read all profiles, update only their own
- departments, categories: public read for all authenticated users
- reports: citizens read all + manage own; department/admin read all + manage assigned
- ai_analyses: read for all authenticated; insert/update for owner of related report
- actions_taken: read for all authenticated; insert by department/admin
- notifications: owner-only access

## Notes
- Uses auth.uid() for ownership checks
- Reports default user_id to auth.uid()
- Geo-coordinates stored as decimal lat/lng
- Status workflow: submitted -> analyzing -> analyzed -> assigned -> in_progress -> resolved/closed
- is_duplicate and master_report_id support duplicate detection
*/

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  contact_email text,
  contact_phone text,
  address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Problem categories table
CREATE TABLE IF NOT EXISTS problem_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text NOT NULL,
  color text NOT NULL,
  default_priority int DEFAULT 3,
  expected_resolution_hours int DEFAULT 48,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'department', 'admin')),
  department_id uuid REFERENCES departments(id),
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES problem_categories(id),
  title text,
  description text,
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  location_address text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'analyzing', 'analyzed', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'
  )),
  priority int DEFAULT 3,
  department_id uuid REFERENCES departments(id),
  assigned_to uuid REFERENCES auth.users(id),
  image_urls jsonb DEFAULT '[]'::jsonb,
  is_duplicate boolean DEFAULT false,
  master_report_id uuid REFERENCES reports(id),
  submitted_at timestamptz DEFAULT now(),
  assigned_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  detected_problem text,
  problem_confidence numeric(4,3),
  visible_conditions jsonb DEFAULT '[]'::jsonb,
  extracted_context jsonb DEFAULT '{}'::jsonb,
  text_confidence numeric(4,3),
  final_problem_type text,
  final_confidence numeric(4,3),
  authenticity_score numeric(4,3),
  is_authentic boolean,
  verification_details jsonb DEFAULT '{}'::jsonb,
  possible_causes jsonb DEFAULT '[]'::jsonb,
  recommended_action text,
  action_confidence numeric(4,3),
  alternative_actions jsonb DEFAULT '[]'::jsonb,
  related_incident_count int DEFAULT 0,
  relationship_graph jsonb DEFAULT '{}'::jsonb,
  processing_time_ms int,
  is_manual_override boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Actions taken table
CREATE TABLE IF NOT EXISTS actions_taken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  description text,
  performed_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  after_image_urls jsonb DEFAULT '[]'::jsonb,
  cost numeric(10,2),
  duration_minutes int,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_department ON reports(department_id);
CREATE INDEX IF NOT EXISTS idx_reports_coords ON reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_report ON actions_taken(report_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============ RLS ============

-- Departments: all authenticated can read
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dept_select_all" ON departments;
CREATE POLICY "dept_select_all" ON departments FOR SELECT TO authenticated USING (true);

-- Categories: all authenticated can read
ALTER TABLE problem_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cat_select_all" ON problem_categories;
CREATE POLICY "cat_select_all" ON problem_categories FOR SELECT TO authenticated USING (true);

-- Profiles: all authenticated can read, users update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_select_all" ON profiles;
CREATE POLICY "profile_select_all" ON profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profile_insert_own" ON profiles;
CREATE POLICY "profile_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profile_update_own" ON profiles;
CREATE POLICY "profile_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Reports: citizens read all + manage own; department/admin read all + manage
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reports_select_all" ON reports;
CREATE POLICY "reports_select_all" ON reports FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "reports_insert_own" ON reports;
CREATE POLICY "reports_insert_own" ON reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reports_update_own_or_staff" ON reports;
CREATE POLICY "reports_update_own_or_staff" ON reports FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('department', 'admin')))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('department', 'admin')));
DROP POLICY IF EXISTS "reports_delete_own" ON reports;
CREATE POLICY "reports_delete_own" ON reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- AI analyses: all authenticated can read, owner or staff can insert/update
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_select_all" ON ai_analyses;
CREATE POLICY "ai_select_all" ON ai_analyses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ai_insert_owner_or_staff" ON ai_analyses;
CREATE POLICY "ai_insert_owner_or_staff" ON ai_analyses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM reports WHERE reports.id = ai_analyses.report_id AND (reports.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('department', 'admin'))))
  );
DROP POLICY IF EXISTS "ai_update_staff" ON ai_analyses;
CREATE POLICY "ai_update_staff" ON ai_analyses FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('department', 'admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('department', 'admin')));

-- Actions taken: all authenticated read; department/admin insert
ALTER TABLE actions_taken ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "actions_select_all" ON actions_taken;
CREATE POLICY "actions_select_all" ON actions_taken FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "actions_insert_staff" ON actions_taken;
CREATE POLICY "actions_insert_staff" ON actions_taken FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('department', 'admin')));

-- Notifications: owner-only
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select_own" ON notifications;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_insert_own" ON notifications;
CREATE POLICY "notif_insert_own" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_update_own" ON notifications;
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_delete_own" ON notifications;
CREATE POLICY "notif_delete_own" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ TRIGGER: Auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TRIGGER: Update updated_at ============
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated ON profiles;
CREATE TRIGGER trigger_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_reports_updated ON reports;
CREATE TRIGGER trigger_reports_updated BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_ai_updated ON ai_analyses;
CREATE TRIGGER trigger_ai_updated BEFORE UPDATE ON ai_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
