// Admin login page (client component). Signs in through Supabase Auth
// with email + password, using the cookie-based browser client so the
// middleware and the protected admin layout can see the session.
// On success the admin is sent to /admin. A signed-in admin who lands
// here is sent straight to /admin as well.

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabase-browser";

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";
const labelCls = "mb-1 block text-sm font-medium text-navy";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // If an admin is already signed in, skip the form.
  useEffect(() => {
    let cancelled = false;
    supabaseBrowser.auth
      .getUser()
      .then(({ data }) => {
        if (!cancelled && data.user) {
          router.replace("/admin");
        }
      })
      .catch(() => {
        // Not signed in — stay on the login form.
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // A signed-in non-admin is redirected here by the guard with
  // ?error=not-admin; say so plainly instead of a generic failure.
  useEffect(() => {
    if (searchParams.get("error") === "not-admin") {
      setError("That account is signed in, but it is not an admin account.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured) {
      setError(
        "Admin login is not set up yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see README.md)."
      );
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid Email ID.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSigningIn(true);
    try {
      const { error: signInError } =
        await supabaseBrowser.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      if (signInError) {
        setError(
          signInError.message ||
            "Could not sign you in. Please check your Email ID and password and try again."
        );
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not sign you in. Please check your connection and try again.");
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Admin Sign In</h1>
      <p className="mt-2 text-sm text-slategrey">
        Sign in with your CreditGuru admin account to open the Advisor
        Dashboard.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="admin-email" className={labelCls}>
            Email ID
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="creditguruservices@gmail.com"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className={labelCls}>
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your admin password"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={signingIn}
          className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-deepteal disabled:opacity-60"
        >
          {signingIn ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-slategrey">
        For customers, use the{" "}
        <a href="/portal" className="font-medium text-teal hover:underline">
          Customer Portal
        </a>{" "}
        instead.
      </p>
    </div>
  );
}

// useSearchParams() must sit inside a Suspense boundary, otherwise the
// static prerender of /admin/login fails at build time.
export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-12">
          <h1 className="text-2xl font-bold text-navy">Admin Sign In</h1>
          <p className="mt-2 text-sm text-slategrey">Loading…</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
