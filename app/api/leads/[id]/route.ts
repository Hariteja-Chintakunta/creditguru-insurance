// GET /api/leads/[id] — single lead with family members + quotes.
// PATCH /api/leads/[id] — update the lead status.
// Both ADMIN ONLY (customer personal data).
// [id] accepts either the row uuid (id) or the public lead number
// (lead_id, e.g. CG-2026-0001).

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { LEAD_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function findLead(id: string) {
  const supabase = getSupabaseAdmin();
  const byId = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (byId.data) return { supabase, lead: byId.data };
  const byLeadId = await supabase
    .from("leads")
    .select("*")
    .eq("lead_id", id)
    .maybeSingle();
  return { supabase, lead: byLeadId.data };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const { supabase, lead } = await findLead(params.id);
    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "Lead not found." },
        { status: 404 }
      );
    }
    const [familyRes, quotesRes] = await Promise.all([
      supabase
        .from("family_members")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("quotes")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false }),
    ]);
    return NextResponse.json({
      ok: true,
      lead,
      family_members: familyRes.data ?? [],
      quotes: quotesRes.data ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const body = await request.json().catch(() => null);
    const status = body?.status as string | undefined;
    if (!status || !(LEAD_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid status. Must be one of: ${LEAD_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const { supabase, lead } = await findLead(params.id);
    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "Lead not found." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", lead.id)
      .select()
      .single();
    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Failed to update lead." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, lead: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
