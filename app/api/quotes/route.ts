// POST /api/quotes — admin creates a quote for a lead; the lead is
// emailed and moved to "Quote Sent".
// GET /api/quotes?lead_id= — quotes for one lead (all quotes if omitted).
// Both ADMIN ONLY (customer personal data).
// (PATCH /api/quotes/[id] is the customer's own response — see that file.)

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { sendEmail } from "@/lib/email";
import { quoteSent } from "@/lib/email-templates";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const {
      lead_id,
      company_name,
      policy_name,
      premium_amount,
      coverage_amount,
      waiting_period,
      benefits,
      claim_settlement,
      notes,
    } = body as Record<string, unknown>;

    const missing: string[] = [];
    if (!lead_id || typeof lead_id !== "string") missing.push("lead_id");
    if (!company_name || typeof company_name !== "string")
      missing.push("company_name");
    if (!policy_name || typeof policy_name !== "string")
      missing.push("policy_name");
    if (premium_amount === undefined || premium_amount === null || premium_amount === "")
      missing.push("premium_amount");
    if (!coverage_amount || typeof coverage_amount !== "string")
      missing.push("coverage_amount");
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Resolve the lead by row id first, then by public lead number.
    let lead: Record<string, unknown> | null = null;
    const byId = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id as string)
      .maybeSingle();
    if (byId.data) {
      lead = byId.data;
    } else {
      const byLeadId = await supabase
        .from("leads")
        .select("*")
        .eq("lead_id", lead_id as string)
        .maybeSingle();
      lead = byLeadId.data;
    }
    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "Lead not found." },
        { status: 404 }
      );
    }

    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        lead_id: lead.id,
        company_name,
        policy_name,
        premium_amount: Number(premium_amount),
        coverage_amount,
        waiting_period: waiting_period ?? null,
        benefits: benefits ?? null,
        claim_settlement: claim_settlement ?? null,
        notes: notes ?? null,
        status: "Sent",
      })
      .select()
      .single();

    if (error || !quote) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Failed to create quote." },
        { status: 500 }
      );
    }

    await supabase
      .from("leads")
      .update({ status: "Quote Sent" })
      .eq("id", lead.id);

    try {
      const mail = quoteSent(lead as unknown as Lead, quote);
      await sendEmail({
        to: lead.email as string,
        subject: mail.subject,
        html: mail.html,
        template: "quote_sent",
      });
    } catch {
      // Email failure must not fail the quote creation.
    }

    return NextResponse.json({ ok: true, quote }, { status: 201 });
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
    const leadId = request.nextUrl.searchParams.get("lead_id");

    let query = supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (leadId) {
      // Accept a row id or a public lead number (CG-YYYY-NNNN).
      const byId = await supabase
        .from("leads")
        .select("id")
        .eq("id", leadId)
        .maybeSingle();
      if (byId.data) {
        query = query.eq("lead_id", byId.data.id);
      } else {
        const byLeadId = await supabase
          .from("leads")
          .select("id")
          .eq("lead_id", leadId)
          .maybeSingle();
        if (!byLeadId.data) {
          return NextResponse.json({ ok: true, quotes: [] });
        }
        query = query.eq("lead_id", byLeadId.data.id);
      }
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, quotes: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
