import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const connectionString =
  process.env.DATABASE_URL ||
  (!isProduction
    ? "postgresql://postgres:postgres@localhost:5432/civiceye"
    : "");

export const pool = new Pool({
  connectionString,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function initAgentMemoryTables() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'running',
      problem_type TEXT,
      final_confidence NUMERIC(5,4),
      requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
      final_action TEXT,
      execution_time_ms INTEGER,
      request_json JSONB,
      response_json JSONB
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_steps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
      iteration INTEGER NOT NULL,
      tool_name TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL,
      confidence NUMERIC(5,4),
      duration_ms INTEGER,
      input_json JSONB,
      output_json JSONB,
      error_text TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_decisions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
      report_id TEXT NOT NULL,
      action TEXT NOT NULL,
      confidence NUMERIC(5,4),
      requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
      reasoning JSONB NOT NULL DEFAULT '[]'::jsonb,
      decision_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id TEXT NOT NULL,
      run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
      is_correct BOOLEAN NOT NULL,
      corrected_problem_type TEXT,
      corrected_root_cause TEXT,
      corrected_department TEXT,
      notes TEXT,
      feedback_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_learnings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pattern_key TEXT NOT NULL,
      problem_type TEXT NOT NULL,
      sample_size INTEGER NOT NULL DEFAULT 0,
      success_rate NUMERIC(5,4),
      confidence NUMERIC(5,4),
      pattern_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(pattern_key, problem_type)
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_agent_runs_report ON agent_runs(report_id);
    CREATE INDEX IF NOT EXISTS idx_agent_steps_run ON agent_steps(run_id);
    CREATE INDEX IF NOT EXISTS idx_agent_feedback_report ON agent_feedback(report_id);
  `);
}

export async function initDb() {
  console.log("🔄 Initializing PostgreSQL database tables...");
  try {
    // 1. Extensions
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 2. Departments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        address TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 3. Problem categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS problem_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        default_priority INT DEFAULT 3,
        expected_resolution_hours INT DEFAULT 48,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 4. Users / Profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'department', 'admin')),
        department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
        phone TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 5. Reports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES problem_categories(id) ON DELETE SET NULL,
        title TEXT,
        description TEXT,
        latitude NUMERIC(10,8) NOT NULL,
        longitude NUMERIC(11,8) NOT NULL,
        location_address TEXT,
        status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
          'submitted', 'analyzing', 'analyzed', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'
        )),
        priority INT DEFAULT 3,
        department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        image_urls JSONB DEFAULT '[]'::jsonb,
        is_duplicate BOOLEAN DEFAULT false,
        master_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
        submitted_at TIMESTAMPTZ DEFAULT now(),
        assigned_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 6. AI analyses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
        detected_problem TEXT,
        problem_confidence NUMERIC(4,3),
        visible_conditions JSONB DEFAULT '[]'::jsonb,
        extracted_context JSONB DEFAULT '{}'::jsonb,
        text_confidence NUMERIC(4,3),
        final_problem_type TEXT,
        final_confidence NUMERIC(4,3),
        authenticity_score NUMERIC(4,3),
        is_authentic BOOLEAN,
        verification_details JSONB DEFAULT '{}'::jsonb,
        possible_causes JSONB DEFAULT '[]'::jsonb,
        recommended_action TEXT,
        action_confidence NUMERIC(4,3),
        alternative_actions JSONB DEFAULT '[]'::jsonb,
        related_incident_count INT DEFAULT 0,
        relationship_graph JSONB DEFAULT '{}'::jsonb,
        processing_time_ms INT,
        is_manual_override BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 7. Actions taken table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS actions_taken (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL,
        description TEXT,
        performed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        after_image_urls JSONB DEFAULT '[]'::jsonb,
        cost NUMERIC(10,2),
        duration_minutes INT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 8. Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Seed departments
    await pool.query(`
      INSERT INTO departments (name, description, contact_email, contact_phone, address, is_active)
      VALUES
        ('Drainage & Water', 'Manages stormwater drains, flood prevention, and sewer lines', 'drainage@city.gov', '+1 555-0191', '100 Waterworks Blvd', true),
        ('Roads & Infrastructure', 'Handles road repairs, potholes, and sidewalks', 'roads@city.gov', '+1 555-0192', '250 Infrastructure Ave', true),
        ('Sanitation', 'Municipal waste collection, street cleaning, and trash piles', 'sanitation@city.gov', '+1 555-0193', '400 Green Way', true),
        ('Emergency Services', 'First response for critical hazards and urgent issues', 'emergency@city.gov', '+1 555-9999', '10 Civic Plaza', true)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Seed categories
    await pool.query(`
      INSERT INTO problem_categories (name, display_name, description, icon, color, default_priority, expected_resolution_hours, is_active)
      VALUES
        ('flooding', 'Flooding / Waterlogging', 'Water accumulation on roads, blocked drains, submerged streets', 'Droplets', 'blue', 1, 24, true),
        ('pothole', 'Pothole / Road Damage', 'Cracked pavement, surface potholes, road hazard', 'AlertTriangle', 'amber', 2, 48, true),
        ('garbage', 'Garbage / Illegal Dumping', 'Uncollected waste bins, roadside trash piles, illegal dumps', 'Trash2', 'green', 3, 24, true)
      ON CONFLICT (name) DO NOTHING;
    `);

    await initAgentMemoryTables();

    console.log(
      "✅ PostgreSQL database schema verified and seed data populated.",
    );
  } catch (err) {
    console.error("⚠️ Database initialization error:", err.message);
    throw err;
  }
}
