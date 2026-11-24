// POST /api/leads — create a lead from the public form (PUBLIC, no
// sign-in needed).
// GET  /api/leads?status=&q= — admin list + dashboard metrics
// (ADMIN ONLY: returns customer personal data).
// All DB access goes through the service-role client (getSupabaseAdmin),
// which bypasses RLS; ownership is enforced in code, not by anon RLS.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { adminNotify, sendEmail } from "@/lib/email";
import { generateUniqueReferralCode } from "@/lib/referral";
import { LEAD_STATUSES } from "@/lib/constants";
import {
  adminNewLead,
  leadConfirmation,
} from "@/lib/email-templates";

export const dynamic = "force-dynamic";

function sanitizeSearch(q: string): string {
  return q.replace(/[,()%]/g, "").trim();
}

async function nextLeadId(): Promise<string> {
  const year = new Date().getFullYear();
  try {
    const { data, error } = await getSupabaseAdmin().rpc("next_lead_number");
    if (!error && typeof data === "number") {
      return `CG-${year}-${String(data).padStart(4, "0")}`;
    }
  } catch {
    // Fall through to the count-based fallback below.
  }
  // Fallback if the sequence function is unavailable (e.g. migration not
  // applied yet): derive the next number from the current lead count.
  const { count } = await getSupabaseAdmin()
    .from("leads")
    .select("id", { count: "exact", head: true });
  const n = (count ?? 0) + 1;
  return `CG-${year}-${String(n).padStart(4, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const {
      full_name,
      mobile,
      email,
      city,
      state,
      occupation,
      annual_income,
      insurance_type,
      coverage,
      policy_number,
      existing_policy,
      existing_policy_doc_name,
      notes,
      referred_by,
      family_members,
    } = body as Record<string, unknown>;

    const missing: string[] = [];
    if (!full_name || typeof full_name !== "string") missing.push("full_name");
    if (!mobile || typeof mobile !== "string") missing.push("mobile");
    if (!email || typeof email !== "string") missing.push("email");
    if (!insurance_type || typeof insurance_type !== "string")
      missing.push("insurance_type");
    if (!coverage || typeof coverage !== "string") missing.push("coverage");
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const leadId = await nextLeadId();
    const referralCode = await generateUniqueReferralCode();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        lead_id: leadId,
        full_name,
        mobile,
        email,
        city: city ?? null,
        state: state ?? null,
        occupation: occupation ?? null,
        annual_income: annual_income ?? null,
        insurance_type,
        coverage,
        policy_number: policy_number ?? null,
        existing_policy: Boolean(existing_policy),
        existing_policy_doc_name: existing_policy_doc_name ?? null,
        notes: notes ?? null,
        status: "New",
        referral_code: referralCode,
      })
      .select()
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { ok: false, error: leadError?.message ?? "Failed to create lead." },
        { status: 500 }
      );
    }

    // The customer's own referral code: a referrals row where they are
    // the referrer, so later referrals through their code can be tracked.
    await supabase.from("referrals").insert({
      code: referralCode,
      referrer_name: full_name,
      referrer_email: email,
      status: "Pending",
    });

    // If they came through someone else's code, record them on that row.
    if (referred_by && typeof referred_by === "string") {
      await supabase
        .from("referrals")
        .update({ referred_email: email, referred_name: full_name })
        .eq("code", referred_by.trim().toUpperCase());
    }

    // Family members, if any were added on the form.
    if (Array.isArray(family_members) && family_members.length > 0) {
      const rows = family_members
        .filter(
          (m): m is Record<string, unknown> =>
            Boolean(m) && typeof m === "object" && Boolean(m.name)
        )
        .map((m) => ({
          lead_id: lead.id,
          name: m.name as string,
          dob: (m.dob as string) || null,
          relationship: (m.relationship as string) || null,
        }));
      if (rows.length > 0) {
        await supabase.from("family_members").insert(rows);
      }
    }

    // Emails are best-effort: sendEmail() logs instead of sending when no
    // Resend key is set, and never throws — a mail failure must not fail
    // the lead submission.
    try {
      const confirmation = leadConfirmation(lead, referralCode);
      await sendEmail({
        to: email as string,
        subject: confirmation.subject,
        html: confirmation.html,
        template: "lead_confirmation",
      });
    } catch {
      // Ignore — the lead is already saved.
    }
    try {
      const adminMail = adminNewLead(lead);
      await adminNotify(adminMail.subject, adminMail.html, "admin_new_lead");
    } catch {
      // Ignore — the lead is already saved.
    }

    return NextResponse.json(
      { ok: true, lead_id: leadId, referral_code: referralCode },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const supabase = getSupabaseAdmin();
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && (LEAD_STATUSES as readonly string[]).includes(status)) {
      query = query.eq("status", status);
    }
    if (q) {
      const safe = sanitizeSearch(q);
      if (safe) {
        query = query.or(
          `full_name.ilike.%${safe}%,email.ilike.%${safe}%,mobile.ilike.%${safe}%,lead_id.ilike.%${safe}%`
        );
      }
    }

    const { data: leads, error } = await query;
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // Dashboard metrics (global, not filtered by status/q).
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const in90Days = new Date(today);
    in90Days.setUTCDate(in90Days.getUTCDate() + 90);

    const [
      totalRes,
      newRes,
      quotesRes,
      policiesRes,
      pendingRes,
      renewalsRes,
      conversionsRes,
      premiumsRes,
    ] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "New"),
      supabase.from("quotes").select("id", { count: "exact", head: true }),
      supabase.from("policies").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .in("status", ["New", "Contacted", "Documents Pending"]),
      supabase
        .from("policies")
        .select("id", { count: "exact", head: true })
        .gte("expiry_date", today.toISOString().slice(0, 10))
        .lte("expiry_date", in90Days.toISOString().slice(0, 10)),
      supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("status", "Successful"),
      supabase.from("policies").select("premium_amount"),
    ]);

    const revenue = (premiumsRes.data ?? []).reduce(
      (sum: number, row: { premium_amount: number | null }) =>
        sum + (Number(row.premium_amount) || 0),
      0
    );

    return NextResponse.json({
      ok: true,
      leads: leads ?? [],
      metrics: {
        total: totalRes.count ?? 0,
        new: newRes.count ?? 0,
        quotes_sent: quotesRes.count ?? 0,
        policies_issued: policiesRes.count ?? 0,
        pending_follow_ups: pendingRes.count ?? 0,
        renewals_due: renewalsRes.count ?? 0,
        referral_conversions: conversionsRes.count ?? 0,
        revenue,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
