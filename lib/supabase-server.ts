// Server-side Supabase client (service role). SERVER ONLY — never import
// this from a client component. Falls back to placeholders when env vars
// are absent so `next build` succeeds without a live Supabase project;
// API routes must handle query errors gracefully.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Fail fast with a clear message instead of hanging on a doomed network
  // call to a placeholder host. Every API route wraps its handler in
  // try/catch, so this surfaces as a clean JSON error, never a crash.
  if (!url || !key || url.includes("placeholder")) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (see README.md)."
    );
  }
  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export const isServerSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
);
