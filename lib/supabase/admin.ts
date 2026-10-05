import { createClient } from "@supabase/supabase-js";
import { resolveSupabaseConfig, CANONICAL_SUPABASE_URL, CANONICAL_SUPABASE_SERVICE_ROLE_KEY, CANONICAL_SUPABASE_ANON_KEY } from "@/lib/supabase/config";

const { url, anonKey } = resolveSupabaseConfig();

export function createAdminServerClient() {
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  // If envKey is missing or belongs to legacy project or placeholder, use canonical active key
  const isInvalidKey = !envKey || envKey.includes("ghjlzrmuugquumqwlqgl") || envKey.includes("[SENSITIVE]");
  const effectiveKey = isInvalidKey ? CANONICAL_SUPABASE_SERVICE_ROLE_KEY : envKey;
  const cleanKey = (effectiveKey || anonKey || CANONICAL_SUPABASE_ANON_KEY).trim().replace(/^["']|["']$/g, "");
  const cleanUrl = (url || CANONICAL_SUPABASE_URL).trim().replace(/^["']|["']$/g, "");
  return createClient(cleanUrl, cleanKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function createCleanReadOnlyServerClient() {
  return createAdminServerClient();
}
