import { createClient } from "@supabase/supabase-js";
import { resolveSupabaseConfig } from "@/lib/supabase/config";

const { url, anonKey } = resolveSupabaseConfig();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || anonKey;

export function createAdminServerClient() {
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || anonKey;
  const cleanKey = (rawKey || "").trim().replace(/^["']|["']$/g, "");
  const cleanUrl = (url || "").trim().replace(/^["']|["']$/g, "");
  return createClient(cleanUrl, cleanKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function createCleanReadOnlyServerClient() {
  return createAdminServerClient();
}
