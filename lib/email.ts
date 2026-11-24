// Email workflows for CreditGuru Insurance.
// Sends through Resend when RESEND_API_KEY is set; otherwise records the
// email in the email_logs table (status "logged") and never crashes.
// Every workflow email in the PRD goes through this one function so the
// behaviour is identical with and without a Resend key.

import { Resend } from "resend";
import { getSupabaseAdmin } from "./supabase-server";
import { ADMIN_EMAIL, SITE_NAME } from "./constants";

export type EmailTemplate =
  | "lead_confirmation"
  | "quote_sent"
  | "policy_issued"
  | "renewal_reminder"
  | "referral_reward"
  | "admin_new_lead"
  | "admin_new_referral"
  | "admin_policy_purchased"
  | "admin_claim_request"
  | "admin_renewal_due";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  template: EmailTemplate;
}

export async function sendEmail(
  opts: SendEmailOptions
): Promise<{ status: "sent" | "logged" | "failed" }> {
  let status: "sent" | "logged" | "failed" = "logged";
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: `${SITE_NAME} <hello@creditguruinsurances.com>`,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      status = error ? "failed" : "sent";
    } catch {
      status = "failed";
    }
  }

  // Record every email in email_logs (best effort — never crash the flow).
  try {
    await getSupabaseAdmin().from("email_logs").insert({
      to_email: opts.to,
      template: opts.template,
      subject: opts.subject,
      status,
    });
  } catch {
    // Logging must never break the user-facing flow.
  }

  return { status };
}

export function adminNotify(
  subject: string,
  html: string,
  template: EmailTemplate
) {
  return sendEmail({ to: ADMIN_EMAIL, subject, html, template });
}

export function emailShell(title: string, body: string): string {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1F2937;max-width:600px;margin:0 auto;padding:24px;">
<h2 style="color:#14264C;">${title}</h2>
<div>${body}</div>
<hr style="border:none;border-top:1px solid #E6F4F3;margin:24px 0;">
<p style="font-size:12px;color:#6B7280;">${SITE_NAME} — Securing Life with Good Guidance<br>Hyderabad, Telangana · +91 9392961261 · creditguruservices@gmail.com</p>
</body></html>`;
}
