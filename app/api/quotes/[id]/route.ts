// PATCH /api/quotes/[id] — customer response to a quote:
// "Interested" | "Call Me" | "Need Another Quote" | "Buy Policy".
// Deliberately NOT admin-gated: this is the customer portal's response
// action, and the portal signs in with email + mobile, not Supabase
// Auth. The quote id is an unguessable UUID and the portal is the only
// caller; the admin creates quotes via POST /api/quotes (admin-only).

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { QUOTE_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => null);
    const status = body?.status as string | undefined;
    if (!status || !(QUOTE_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid status. Must be one of: ${QUOTE_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("quotes")
      .update({ status })
      .eq("id", params.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Quote not found." },
        { status: error?.code === "PGRST116" ? 404 : 500 }
      );
    }
    return NextResponse.json({ ok: true, quote: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
