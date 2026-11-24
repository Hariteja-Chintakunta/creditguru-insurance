// GET /api/renewals — renewal dashboard.
// ADMIN ONLY (customer personal data + policy details).
// Every policy with an expiry_date is placed in the SMALLEST window it
// falls inside (days-to-expiry <= window, days >= 0); overdue policies
// are flagged separately. Policies already reminded for that window
// (a row in renewal_reminders) are excluded from the window lists.
// Response: { ok, windows: [{ window_days, policies: [...] }],
//             overdue: [...], log: [...] }

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { RENEWAL_WINDOWS } from "@/lib/constants";
import type { Policy } from "@/lib/types";

export const dynamic = "force-dynamic";

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysToExpiry(
  expiryDate: string | null,
  today: Date
): number | null {
  if (!expiryDate) return null;
  const exp = new Date(`${expiryDate}T00:00:00Z`);
  if (Number.isNaN(exp.getTime())) return null;
  return Math.round((exp.getTime() - today.getTime()) / 86_400_000);
}

/** Smallest renewal window the policy falls inside, or null if it is
 *  overdue (days < 0) or not due within 90 days. */
function smallestWindow(days: number): number | null {
  if (days < 0) return null;
  for (const w of [7, 15, 30, 60, 90]) {
    if (days <= w) return w;
  }
  return null;
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const supabase = getSupabaseAdmin();
    const today = startOfTodayUtc();

    const { data: policies, error: policiesError } = await supabase
      .from("policies")
      .select("*")
      .not("expiry_date", "is", null)
      .order("expiry_date", { ascending: true });
    if (policiesError) {
      return NextResponse.json(
        { ok: false, error: policiesError.message },
        { status: 500 }
      );
    }

    const { data: reminders, error: remindersError } = await supabase
      .from("renewal_reminders")
      .select("*, policies ( policy_number, customer_name, customer_email, customer_mobile, broker, broker_other )")
      .order("sent_at", { ascending: false });
    if (remindersError) {
      return NextResponse.json(
        { ok: false, error: remindersError.message },
        { status: 500 }
      );
    }

    const reminded = new Set<string>(
      (reminders ?? []).map(
        (r: { policy_id: string; window_days: number }) =>
          `${r.policy_id}:${r.window_days}`
      )
    );

    const windows = RENEWAL_WINDOWS.map((windowDays) => ({
      window_days: windowDays,
      policies: [] as (Policy & { days_to_expiry: number })[],
    }));
    const windowByDays = new Map<number, (typeof windows)[number]>(
      windows.map((w) => [w.window_days, w])
    );
    const overdue: (Policy & { days_to_expiry: number })[] = [];

    for (const policy of (policies ?? []) as Policy[]) {
      const days = daysToExpiry(policy.expiry_date, today);
      if (days === null) continue;
      if (days < 0) {
        overdue.push({ ...policy, days_to_expiry: days });
        continue;
      }
      const windowDays = smallestWindow(days);
      if (windowDays === null) continue;
      if (reminded.has(`${policy.id}:${windowDays}`)) continue;
      windowByDays
        .get(windowDays)
        ?.policies.push({ ...policy, days_to_expiry: days });
    }

    const log = (reminders ?? []).map(
      (r: {
        id: string;
        policy_id: string;
        window_days: number;
        channel: string;
        sent_at: string;
        policies?: {
          policy_number?: string;
          customer_name?: string;
          customer_email?: string;
          customer_mobile?: string;
          broker?: string | null;
          broker_other?: string | null;
        } | null;
      }) => ({
        id: r.id,
        policy_id: r.policy_id,
        policy_number: r.policies?.policy_number ?? null,
        customer_name: r.policies?.customer_name ?? null,
        customer_email: r.policies?.customer_email ?? null,
        customer_mobile: r.policies?.customer_mobile ?? null,
        broker: r.policies?.broker ?? null,
        broker_other: r.policies?.broker_other ?? null,
        window_days: r.window_days,
        channel: r.channel,
        sent_at: r.sent_at,
      })
    );

    return NextResponse.json({ ok: true, windows, overdue, log });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
