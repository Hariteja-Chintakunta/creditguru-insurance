// Server layout for the protected admin section (/admin, /admin/policies,
// /admin/renewals). Runs on the server before any admin page renders:
// the visitor must have a Supabase session AND role 'admin' in
// public.profiles, otherwise they are sent to /admin/login. This is the
// second layer behind middleware.ts, which enforces the same rule.
// The login page (/admin/login) lives OUTSIDE this group, so it is never
// wrapped by this layout and cannot redirect to itself.

import Link from "next/link";
import { redirect } from "next/navigation";
import AdminSignOut from "@/components/AdminSignOut";
import { getAdminSession } from "@/lib/supabase-auth";

const navLinkCls =
  "rounded-lg px-3 py-2 text-sm font-medium text-mist/90 hover:bg-white/10 hover:text-white";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-2 text-sm font-bold tracking-wide">
            CreditGuru Admin
          </span>
          <Link href="/admin" className={navLinkCls}>
            Dashboard
          </Link>
          <Link href="/admin/policies" className={navLinkCls}>
            Policies
          </Link>
          <Link href="/admin/renewals" className={navLinkCls}>
            Renewals
          </Link>
          <Link href="/" className={navLinkCls}>
            View Site
          </Link>
          <span className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-mist/80 sm:inline">
              {session.email}
            </span>
            <AdminSignOut />
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
