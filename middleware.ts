// Admin route guard. Runs on every /admin/* request:
// 1. Refreshes the Supabase session (cookie-based, via @supabase/ssr).
// 2. /admin/login is open — everything else under /admin requires a
//    signed-in user whose public.profiles row has role 'admin'.
//    Anyone else is sent to /admin/login (fails closed: any error,
//    including Supabase not being configured, also redirects there).
// The protected admin layout re-checks the same rule server-side, so
// the guard holds even if middleware is ever bypassed.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // The login page itself is open; still refresh the session above so a
  // signed-in admin's cookies stay valid.
  if (request.nextUrl.pathname === "/admin/login") {
    try {
      await supabase.auth.getUser();
    } catch {
      // Session refresh failing must never block the login page.
    }
    return supabaseResponse;
  }

  const loginUrl = new URL("/admin/login", request.url);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(loginUrl);
    }
    // Role check against the caller's own profile row. The
    // profiles_select_own_or_admin RLS policy lets an authenticated user
    // read their own row, so this works with the anon key.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin") {
      loginUrl.searchParams.set("error", "not-admin");
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Fail closed: any error checking the session/role sends the visitor
    // to the login page instead of letting them through.
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
