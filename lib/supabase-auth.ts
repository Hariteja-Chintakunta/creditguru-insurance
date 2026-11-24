// Server-side Supabase Auth helpers (SERVER ONLY).
// Used by the admin route guard (middleware + protected layout) to check
// that the signed-in user exists AND has role 'admin' in public.profiles.
// Uses the anon key (not the service role), so RLS applies: the
// profiles_select_own_or_admin policy lets an authenticated user read
// their own profile row. Never import this from a client component.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        try {
          // Server Components cannot set cookies; the middleware owns
          // refreshing the session. Swallow the error (Supabase docs
          // pattern) so rendering never crashes here.
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore — handled by middleware.
        }
      },
    },
  });
}

export interface AdminSession {
  userId: string;
  email: string | undefined;
}

/** Result of an admin auth check, distinguishing the two failures the
 *  API routes must report differently: 401 = not signed in, 403 =
 *  signed in but not an admin. */
export type AdminAuthResult =
  | { ok: true; userId: string; email: string | undefined }
  | { ok: false; status: 401 | 403 };

/**
 * Checks the caller's Supabase session (cookie-based, via @supabase/ssr)
 * and their public.profiles role. Fails closed: any error (including
 * Supabase not being configured) is treated as not signed in.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, status: 401 };
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin")
      return { ok: false, status: 403 };
    return { ok: true, userId: user.id, email: user.email };
  } catch {
    return { ok: false, status: 401 };
  }
}

/**
 * Returns the signed-in admin's session, or null when there is no
 * session, the user has no profile row, or the profile role is not
 * 'admin'. Fails closed: any error (including Supabase not being
 * configured) returns null.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const result = await requireAdmin();
  if (!result.ok) return null;
  return { userId: result.userId, email: result.email };
}

/**
 * JSON error response for a failed admin check, to be returned at the
 * top of an admin-only API handler: 401 when not signed in, 403 when
 * signed in but not an admin.
 */
export function adminAuthErrorResponse(status: 401 | 403) {
  return NextResponse.json(
    {
      ok: false,
      error:
        status === 401
          ? "Sign in required. Please sign in as an admin."
          : "Admin access required.",
    },
    { status }
  );
}
