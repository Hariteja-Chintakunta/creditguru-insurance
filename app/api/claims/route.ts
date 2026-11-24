// POST /api/claims — customer raises a claim request; admin is emailed.
// (PUBLIC: called from the customer portal.)
// GET /api/claims?email= — claims for one customer (all claims if omitted).
// (ADMIN ONLY: returns customer personal data. The portal reads a
// customer's own claims through POST /api/portal instead.)

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { adminNotify } from "@/lib/email";
import { adminClaimRequest } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

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
      policy_id,
      customer_name,
      customer_email,
      customer_mobile,
      description,
    } = body as Record<string, unknown>;

    const missing: string[] = [];
    if (!customer_name || typeof customer_name !== "string")
      missing.push("customer_name");
    if (!customer_email || typeof customer_email !== "string")
      missing.push("customer_email");
    if (!customer_mobile || typeof customer_mobile !== "string")
      missing.push("customer_mobile");
    if (!description || typeof description !== "string")
      missing.push("description");
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (policy_id && typeof policy_id === "string") {
      const { data: policy } = await supabase
        .from("policies")
        .select("id")
        .eq("id", policy_id)
        .maybeSingle();
      if (!policy) {
        return NextResponse.json(
          { ok: false, error: "Policy not found." },
          { status: 404 }
        );
      }
    }

    const { data: claim, error } = await supabase
      .from("claims")
      .insert({
        policy_id: policy_id ?? null,
        customer_name,
        customer_email,
        customer_mobile,
        description,
        status: "Submitted",
      })
      .select()
      .single();

    if (error || !claim) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Failed to create claim." },
        { status: 500 }
      );
    }

    try {
      const mail = adminClaimRequest(claim);
      await adminNotify(mail.subject, mail.html, "admin_claim_request");
    } catch {
      // Email failure must not fail the claim submission.
    }

    return NextResponse.json({ ok: true, claim }, { status: 201 });
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
    const email = request.nextUrl.searchParams.get("email");

    let query = supabase
      .from("claims")
      .select("*")
      .order("created_at", { ascending: false });
    if (email) query = query.eq("customer_email", email);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, claims: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
