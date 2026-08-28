import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env file manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key] = value;
    }
  }
  return env;
}

const env = loadEnv();
const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

console.log('\n========================================');
console.log('🔍 PostgreSQL / Supabase Connection Test');
console.log('========================================\n');

if (!url || !key || url.includes('your-project.supabase.co') || key.includes('your-anon-key')) {
  console.log('❌ DATABASE NOT CONNECTED: Placeholder / Missing .env values detected.\n');
  console.log('Current configuration:');
  console.log(`- VITE_SUPABASE_URL: ${url || '(not set)'}`);
  console.log(`- VITE_SUPABASE_ANON_KEY: ${key ? key.substring(0, 15) + '...' : '(not set)'}\n`);
  console.log('👉 To connect your database:');
  console.log('1. Go to https://supabase.com (or your local Supabase instance).');
  console.log('2. Open Project Settings -> API.');
  console.log('3. Copy your "Project URL" and "anon public key".');
  console.log('4. Paste them into your .env file in the root directory.');
  console.log('5. Run "npm run check-db" again.\n');
  process.exit(1);
}

console.log(`Connecting to: ${url} ...`);

const supabase = createClient(url, key);

async function testConnection() {
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('problem_categories').select('count').limit(1);
    const duration = Date.now() - start;

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.problem_categories" does not exist')) {
        console.log(`\n⚠️  CONNECTED TO SUPABASE (${duration}ms), BUT TABLES ARE MISSING!`);
        console.log('The core database schema has not been applied yet.\n');
        console.log('👉 Steps to create the tables:');
        console.log('1. Open your Supabase Dashboard -> SQL Editor.');
        console.log('2. Paste and run: supabase/migrations/20260822125350_001_create_core_schema.sql');
        console.log('3. Paste and run: supabase/seed.sql\n');
        process.exit(1);
      }
      console.log(`\n❌ Query failed with error: ${error.message} (Code: ${error.code})`);
      process.exit(1);
    }

    console.log(`\n✅ DATABASE CONNECTED SUCCESSFULLY! (${duration}ms response time)`);
    console.log('✅ PostgreSQL tables and PostgREST API are reachable.');
    console.log('\nYou can now run "npm run dev" and log in or create an account!\n');
  } catch (err) {
    console.log(`\n❌ Failed to connect: ${err.message}`);
    process.exit(1);
  }
}

testConnection();
