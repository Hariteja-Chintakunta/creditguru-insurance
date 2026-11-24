// Sign-out button for the admin header (client component).
// Signs out through the cookie-based browser client so the middleware
// and server layout immediately see the session as gone, then sends
// the admin back to the login page.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await supabaseBrowser.auth.signOut();
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-60"
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
