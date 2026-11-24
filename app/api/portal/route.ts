// POST /api/portal — customer portal sign-in (no password step yet:
// the customer proves ownership with the email + mobile from their
// enquiry). Finds the most recent lead matching both, and returns the
// full PortalData: profile, family, quotes, tracked policies, documents,
// claims, referrals, referral code and reward tier.
// PUBLIC BY DESIGN: this is the customer portal's own route (the
// email+mobile check inside is the ownership proof). It must NOT be
// admin-gated. 404 { ok: false, error: "No record found for this email
// and mobile." } when neither a lead nor a policy matches.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { rewardTierForPolicies } from "@/lib/referral";
import type { Lead, PortalData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = body?.email as string | undefined;
    const mobile = body?.mobile as string | undefined;
    if (!email || !mobile) {
      return NextResponse.json(
        { ok: false, error: "email and mobile are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Most recent lead matching both email and mobile.
    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("email", email)
      .eq("mobile", mobile)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Policies for this customer (either contact detail matches).
    const { data: policies } = await supabase
      .from("policies")
      .select("*")
      .or(`customer_email.eq.${email},customer_mobile.eq.${mobile}`)
      .order("created_at", { ascending: false });

    const leadRow = lead as Lead | null;
    const policyList = (policies ?? []) as PortalData["policies"];

    if (!leadRow && policyList.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No record found for this email and mobile." },
        { status: 404 }
      );
    }

    // Profile comes from the lead when there is one; otherwise from the
    // most recent tracked policy.
    const profile: PortalData["profile"] = leadRow
      ? {
          full_name: leadRow.full_name,
          email: leadRow.email,
          mobile: leadRow.mobile,
          policy_number: leadRow.policy_number,
          notes: leadRow.notes,
        }
      : {
          full_name: policyList[0].customer_name,
          email: policyList[0].customer_email,
          mobile: policyList[0].customer_mobile,
          policy_number: policyList[0].policy_number,
          notes: policyList[0].notes,
        };

    const [familyRes, quotesRes, documentsRes, claimsRes, referralsRes] =
      await Promise.all([
        leadRow
          ? supabase
              .from("family_members")
              .select("*")
              .eq("lead_id", leadRow.id)
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [] as PortalData["family"] }),
        leadRow
          ? supabase
              .from("quotes")
              .select("*")
              .eq("lead_id", leadRow.id)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] as PortalData["quotes"] }),
        // Documents for these policies and/or this lead.
        (() => {
          let q = supabase.from("documents").select("*");
          const policyIds = policyList.map((p) => p.id);
          if (leadRow && policyIds.length > 0) {
            q = q.or(
              `lead_id.eq.${leadRow.id},policy_id.in.(${policyIds.join(",")})`
            );
          } else if (leadRow) {
            q = q.eq("lead_id", leadRow.id);
          } else if (policyIds.length > 0) {
            q = q.in("policy_id", policyIds);
          } else {
            return Promise.resolve({ data: [] as PortalData["documents"] });
          }
          return q.order("created_at", { ascending: false });
        })(),
        supabase
          .from("claims")
          .select("*")
          .eq("customer_email", email)
          .order("created_at", { ascending: false }),
        supabase
          .from("referrals")
          .select("*")
          .eq("referrer_email", email)
          .order("created_at", { ascending: false }),
      ]);

    const referrals = (referralsRes.data ?? []) as PortalData["referrals"];
    const successful = referrals.filter((r) => r.status === "Successful").length;
    const referralCode =
      leadRow?.referral_code ?? referrals[0]?.code ?? null;

    const portal: PortalData = {
      profile,
      family: (familyRes.data ?? []) as PortalData["family"],
      quotes: (quotesRes.data ?? []) as PortalData["quotes"],
      policies: policyList,
      documents: (documentsRes.data ?? []) as PortalData["documents"],
      claims: (claimsRes.data ?? []) as PortalData["claims"],
      referrals,
      referral_code: referralCode,
      reward_tier: rewardTierForPolicies(successful),
    };

    return NextResponse.json({ ok: true, ...portal });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
