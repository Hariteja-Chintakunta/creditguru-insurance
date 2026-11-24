// POST /api/renewals/send — send renewal reminders.
// ADMIN ONLY (sends messages to customers).
// Single: { policy_id, channel } (optional window_days override).
// Bulk:   { window_days, channel } — every policy whose smallest window
//         is window_days and which has no reminder row for it yet.
// A renewal_reminders row is created for every send. Email sends a real
// renewalReminder email; SMS/WhatsApp have no provider wired yet, so
// those are logged only (see provider_note). For WhatsApp the response
// includes wa.me links the admin can open to message the customer.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { sendEmail } from "@/lib/email";
import { renewalReminder } from "@/lib/email-templates";
import { RENEWAL_WINDOWS } from "@/lib/constants";
import type { Policy } from "@/lib/types";

export const dynamic = "force-dynamic";

const CHANNELS = ["Email", "SMS", "WhatsApp"] as const;
type Channel = (typeof CHANNELS)[number];

const PROVIDER_NOTE =
  "SMS/WhatsApp need provider setup — logged only";

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

/** Normalise an Indian mobile to the digits wa.me expects (91 + 10 digits). */
function whatsappDigits(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

function whatsappLink(policy: Policy, windowDays: number): string {
  const message =
    `Hi ${policy.customer_name}, your ${policy.product_type} policy ` +
    `${policy.policy_number} with ${policy.company_name} expires on ` +
    `${policy.expiry_date} (in ${windowDays} days). ` +
    `Please contact CreditGuru Insurance on +91 9392961261 to renew it on time.`;
  return `https://wa.me/${whatsappDigits(policy.customer_mobile)}?text=${encodeURIComponent(message)}`;
}

async function alreadyReminded(
  policyId: string,
  windowDays: number
): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from("renewal_reminders")
    .select("id")
    .eq("policy_id", policyId)
    .eq("window_days", windowDays)
    .maybeSingle();
  return Boolean(data);
}

async function sendOne(
  policy: Policy,
  windowDays: number,
  channel: Channel
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("renewal_reminders").insert({
    policy_id: policy.id,
    window_days: windowDays,
    channel,
  });
  if (error) return false;

  if (channel === "Email") {
    try {
      const mail = renewalReminder(policy, windowDays);
      await sendEmail({
        to: policy.customer_email,
        subject: mail.subject,
        html: mail.html,
        template: "renewal_reminder",
      });
    } catch {
      // The reminder row is already logged; a mail failure must not
      // fail the whole send.
    }
  }
  return true;
}

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

    const { policy_id, window_days, channel } = body as Record<
      string,
      unknown
    >;
    const chosenChannel: Channel =
      typeof channel === "string" &&
      (CHANNELS as readonly string[]).includes(channel)
        ? (channel as Channel)
        : "Email";

    const supabase = getSupabaseAdmin();
    const today = startOfTodayUtc();

    // --- Single policy -------------------------------------------------
    if (policy_id && typeof policy_id === "string") {
      const { data: policy, error } = await supabase
        .from("policies")
        .select("*")
        .eq("id", policy_id)
        .maybeSingle();
      if (error || !policy) {
        return NextResponse.json(
          { ok: false, error: "Policy not found." },
          { status: 404 }
        );
      }
      const p = policy as Policy;
      const days = daysToExpiry(p.expiry_date, today);
      if (days === null) {
        return NextResponse.json(
          { ok: false, error: "Policy has no expiry date." },
          { status: 400 }
        );
      }
      const windowDays =
        typeof window_days === "number" &&
        (RENEWAL_WINDOWS as readonly number[]).includes(window_days)
          ? window_days
          : days < 0
            ? 7 // Overdue: most urgent window.
            : smallestWindow(days);
      if (windowDays === null) {
        return NextResponse.json(
          { ok: false, error: "Policy is not due within 90 days." },
          { status: 400 }
        );
      }
      if (await alreadyReminded(p.id, windowDays)) {
        return NextResponse.json({ ok: true, sent: 0, already_sent: true });
      }
      const sent = await sendOne(p, windowDays, chosenChannel);
      const response: Record<string, unknown> = {
        ok: true,
        sent: sent ? 1 : 0,
        window_days: windowDays,
      };
      if (chosenChannel !== "Email") {
        response.provider_note = PROVIDER_NOTE;
      }
      if (chosenChannel === "WhatsApp") {
        response.whatsapp_link = whatsappLink(p, windowDays);
      }
      return NextResponse.json(response);
    }

    // --- Bulk by window ------------------------------------------------
    if (typeof window_days === "number") {
      if (!(RENEWAL_WINDOWS as readonly number[]).includes(window_days)) {
        return NextResponse.json(
          {
            ok: false,
            error: `Invalid window_days. Must be one of: ${RENEWAL_WINDOWS.join(", ")}`,
          },
          { status: 400 }
        );
      }
      const { data: policies, error } = await supabase
        .from("policies")
        .select("*")
        .not("expiry_date", "is", null);
      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }
      let sent = 0;
      const whatsappLinks: string[] = [];
      for (const policy of (policies ?? []) as Policy[]) {
        const days = daysToExpiry(policy.expiry_date, today);
        if (days === null || days < 0) continue;
        if (smallestWindow(days) !== window_days) continue;
        if (await alreadyReminded(policy.id, window_days)) continue;
        if (await sendOne(policy, window_days, chosenChannel)) {
          sent += 1;
          if (chosenChannel === "WhatsApp") {
            whatsappLinks.push(whatsappLink(policy, window_days));
          }
        }
      }
      const response: Record<string, unknown> = {
        ok: true,
        sent,
        window_days,
      };
      if (chosenChannel !== "Email") {
        response.provider_note = PROVIDER_NOTE;
      }
      if (chosenChannel === "WhatsApp") {
        response.whatsapp_links = whatsappLinks;
      }
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { ok: false, error: "Provide policy_id (single) or window_days (bulk)." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
