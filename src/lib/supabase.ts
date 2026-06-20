import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const placeholderValues = new Set([
  "",
  "your_project_url",
  "your_anon_or_publishable_key",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
]);

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey: string | null = null;

function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ""
  };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();

  return /^https?:\/\//.test(url) && !placeholderValues.has(url) && !placeholderValues.has(anonKey);
}

export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getSupabaseConfig();
  const configKey = `${url}:${anonKey}`;

  if (cachedClient && cachedConfigKey === configKey) {
    return cachedClient;
  }

  cachedClient = createClient(url, anonKey);
  cachedConfigKey = configKey;

  return cachedClient;
}
