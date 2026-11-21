import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://bepkvdfeqjcwwwgmxnyf.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_KXVbmbTVS2L48PdNih0ybw_k-uf1jq6";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
