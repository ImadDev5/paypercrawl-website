import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/**
 * Client-side Supabase client (uses @supabase/ssr).
 * Stores PKCE code_verifier and session tokens in cookies so the
 * server-side callback route can access them.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
