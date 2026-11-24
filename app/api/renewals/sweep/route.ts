// POST /api/renewals/sweep — automatic renewal sweep.
// ADMIN ONLY: a daily cron must call it with a signed-in admin session
// (e.g. a server-side job holding admin credentials); there is no
// separate cron secret yet — adding one (CRON_SECRET) is a follow-up
// if the sweep is ever called from an unauthenticated scheduler.
// Finds every policy due in any renewal window (0–90 days to expiry)
// without an existing reminder row for that window, creates the
// renewal_reminders row and sends the Email reminder. Overdue policies
// are swept into the 7-day window (most urgent). Intended to be called
// once a day (e.g. from a cron) — already-reminded policies are skipped,
// so re-running it is safe. Response: { ok, created: n }.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { sendEmail } from "@/lib/email";
import { renewalReminder } from "@/lib/email-templates";
import type { Policy } from "@/lib/types";

export const dynamic = "force-dynamic";

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysToExpiry(expiryDate: string | null, today: Date): number | null {
  if (!expiryDate) return null;
  const exp = new Date(`${expiryDate}T00:00:00Z`);
  if (Number.isNaN(exp.getTime())) return null;
  return Math.round((exp.getTime() - today.getTime()) / 86_400_000);
}

function smallestWindow(days: number): number | null {
  if (days < 0) return null;
  for (const w of [7, 15, 30, 60, 90]) {
    if (days <= w) return w;
  }
  return null;
}

export async function POST() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const supabase = getSupabaseAdmin();
    const today = startOfTodayUtc();

    const { data: policies, error: policiesError } = await supabase
      .from("policies")
      .select("*")
      .not("expiry_date", "is", null);
    if (policiesError) {
      return NextResponse.json(
        { ok: false, error: policiesError.message },
        { status: 500 }
      );
    }

    const { data: existing } = await supabase
      .from("renewal_reminders")
      .select("policy_id, window_days");
    const reminded = new Set<string>(
      (existing ?? []).map(
        (r: { policy_id: string; window_days: number }) =>
          `${r.policy_id}:${r.window_days}`
      )
    );

    let created = 0;
    for (const policy of (policies ?? []) as Policy[]) {
      const days = daysToExpiry(policy.expiry_date, today);
      if (days === null) continue;
      // Overdue policies go into the 7-day window; otherwise the
      // smallest window the policy falls inside.
      const windowDays = days < 0 ? 7 : smallestWindow(days);
      if (windowDays === null) continue;
      if (reminded.has(`${policy.id}:${windowDays}`)) continue;

      const { error } = await supabase.from("renewal_reminders").insert({
        policy_id: policy.id,
        window_days: windowDays,
        channel: "Email",
      });
      if (error) continue;
      created += 1;
      reminded.add(`${policy.id}:${windowDays}`);

      try {
        const mail = renewalReminder(policy, windowDays);
        await sendEmail({
          to: policy.customer_email,
          subject: mail.subject,
          html: mail.html,
          template: "renewal_reminder",
        });
      } catch {
        // Row is logged; a mail failure must not stop the sweep.
      }
    }

    return NextResponse.json({ ok: true, created });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
