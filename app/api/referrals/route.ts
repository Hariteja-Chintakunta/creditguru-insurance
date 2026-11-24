// GET /api/referrals?email= — referral summary for one referrer:
// their code, how many people used it, pending vs successful counts,
// the reward tier earned, and the referral rows themselves.
// ADMIN ONLY. (The customer portal reads its own referral stats
// through POST /api/portal; its separate GET /api/referrals call is a
// bonus that degrades gracefully to the portal data when it fails.)

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { rewardTierForPolicies } from "@/lib/referral";
import type { Referral } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "email query parameter is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_email", email)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const referrals = (data ?? []) as Referral[];
    const successful = referrals.filter((r) => r.status === "Successful").length;
    const pending = referrals.filter((r) => r.status === "Pending").length;

    return NextResponse.json({
      ok: true,
      code: referrals[0]?.code ?? null,
      count: referrals.length,
      pending,
      successful,
      reward_tier: rewardTierForPolicies(successful),
      referrals,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
