const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.warn("Supabase environment variables are missing. Copy backend/.env.example to backend/.env and fill it in.");
}

const admin = url && serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
const publicClient = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

module.exports = { admin, publicClient };
