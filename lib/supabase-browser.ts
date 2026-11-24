// Browser Supabase client (cookie-based, via @supabase/ssr).
// Use this — NOT the plain supabase-js client in lib/supabase.ts —
// wherever the session must be visible to the server (admin login,
// sign-out). @supabase/ssr stores the session in cookies, so the
// middleware and server components can read it. When env vars are
// absent (local build without a Supabase project), falls back to
// placeholders so `next build` still succeeds; auth calls will fail
// gracefully at runtime and the UI shows a clear message.

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
);
