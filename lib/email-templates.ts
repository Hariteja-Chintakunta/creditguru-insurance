// Email templates for CreditGuru Insurance — one function per PRD workflow.
// Each returns { subject, html } built with emailShell() from lib/email.
// The API routes send them via sendEmail()/adminNotify(); nothing here
// sends email by itself. All values are HTML-escaped before interpolation.

import { emailShell } from "./email";
import {
  ADMIN_EMAIL,
  EMAIL,
  PHONE,
  REFERRAL_REWARD_TIERS,
  SITE_NAME,
  referralLink,
} from "./constants";
import type { Claim, Lead, Policy, Quote, Referral } from "./types";

export interface EmailTemplateResult {
  subject: string;
  html: string;
}

function esc(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string | number | null | undefined): string {
  const v = esc(value);
  if (!v) return "";
  return `<p><strong>${esc(label)}:</strong> ${v}</p>`;
}

function contactLine(): string {
  return `<p>Questions? Call us on ${esc(PHONE)} or write to ${esc(EMAIL)}.<br>${esc(SITE_NAME)} — Securing Life with Good Guidance.</p>`;
}

/** Customer: thank-you + next steps after submitting the lead form. */
export function leadConfirmation(
  lead: Lead,
  referralCode: string
): EmailTemplateResult {
  const subject = "Thank you for your enquiry — CreditGuru Insurance";
  const html = emailShell(
    `Thank you, ${esc(lead.full_name)}!`,
    `<p>We have received your enquiry for <strong>${esc(lead.insurance_type)}</strong> with a cover of <strong>${esc(lead.coverage)}</strong>. Our team will call you shortly on ${esc(lead.mobile)} to understand your needs and share the best options for you.</p>
${row("Your enquiry number", lead.lead_id)}
${row("Insurance type", lead.insurance_type)}
${row("Coverage", lead.coverage)}
${lead.policy_number ? row("Existing policy number", lead.policy_number) : ""}
<p><strong>Your referral code is ${esc(referralCode)}.</strong> Share it with family and friends — when they buy a policy through your code, you earn rewards: ${REFERRAL_REWARD_TIERS.map(
      (t) => `${t.policies} polic${t.policies === 1 ? "y" : "ies"} — ${t.reward}`
    ).join(", ")}.</p>
<p>Your referral link: <a href="${esc(referralLink(referralCode))}">${esc(referralLink(referralCode))}</a></p>
${contactLine()}`
  );
  return { subject, html };
}

/** Customer: a quote has been prepared for their enquiry. */
export function quoteSent(lead: Lead, quote: Quote): EmailTemplateResult {
  const subject = `Your ${quote.policy_name} quote is ready — CreditGuru Insurance`;
  const html = emailShell(
    "Your quote is ready",
    `<p>Hi ${esc(lead.full_name)},</p>
<p>We have prepared a quote for your ${esc(lead.insurance_type)} enquiry. Here are the details:</p>
${row("Company", quote.company_name)}
${row("Policy", quote.policy_name)}
${row("Premium", quote.premium_amount ? `₹${esc(quote.premium_amount)}` : null)}
${row("Coverage", quote.coverage_amount)}
${row("Waiting period", quote.waiting_period)}
${row("Benefits", quote.benefits)}
${row("Claim settlement", quote.claim_settlement)}
${quote.notes ? row("Note", quote.notes) : ""}
<p>Reply to this email or call us on ${esc(PHONE)} to say <strong>Interested</strong>, <strong>Call Me</strong>, <strong>Need Another Quote</strong>, or <strong>Buy Policy</strong> — we will take it from there.</p>
${contactLine()}`
  );
  return { subject, html };
}

/** Customer: their policy has been issued / recorded. */
export function policyIssued(policy: Policy): EmailTemplateResult {
  const subject = `Your policy ${policy.policy_number} is active — CreditGuru Insurance`;
  const html = emailShell(
    "Your policy is active",
    `<p>Hi ${esc(policy.customer_name)},</p>
<p>Good news — your policy is now active. Keep this email safe; it has your policy details in one place.</p>
${row("Policy number", policy.policy_number)}
${row("Company", policy.company_name)}
${row("Product", policy.product_type)}
${row("Bought from", policy.source_website)}
${row("Premium", policy.premium_amount ? `₹${esc(policy.premium_amount)}` : null)}
${row("Coverage", policy.coverage_amount)}
${row("Start date", policy.start_date)}
${row("Expiry date", policy.expiry_date)}
<p>We will remind you before your renewal date so your cover never lapses. For any claim help, just reply to this email or call us on ${esc(PHONE)}.</p>
${contactLine()}`
  );
  return { subject, html };
}

/** Customer: renewal reminder for a policy expiring soon. */
export function renewalReminder(
  policy: Policy,
  windowDays: number
): EmailTemplateResult {
  const subject = `Your policy ${policy.policy_number} renews in ${windowDays} days — CreditGuru Insurance`;
  const html = emailShell(
    "Time to renew your policy",
    `<p>Hi ${esc(policy.customer_name)},</p>
<p>Your <strong>${esc(policy.product_type)}</strong> policy with ${esc(policy.company_name)} expires on <strong>${esc(policy.expiry_date)}</strong> — that is in ${esc(windowDays)} days.</p>
${row("Policy number", policy.policy_number)}
${row("Company", policy.company_name)}
${row("Expiry date", policy.expiry_date)}
${row("Premium", policy.premium_amount ? `₹${esc(policy.premium_amount)}` : null)}
${row("Coverage", policy.coverage_amount)}
<p>Renewing on time keeps your cover continuous — no waiting period starts again and no claim is ever rejected for a gap. Reply to this email or call us on ${esc(PHONE)} and we will renew it for you, and check whether a better plan is available this year.</p>
${contactLine()}`
  );
  return { subject, html };
}

/** Customer: they earned a referral reward. */
export function referralReward(
  name: string,
  code: string,
  tier: string
): EmailTemplateResult {
  const subject = `You earned a ${tier} — CreditGuru Insurance referrals`;
  const html = emailShell(
    `Congratulations, ${esc(name)}!`,
    `<p>Your referral code <strong>${esc(code)}</strong> has earned you a <strong>${esc(tier)}</strong>.</p>
<p>Thank you for trusting ${esc(SITE_NAME)} and for recommending us to your family and friends. Keep sharing your code — every successful referral brings you closer to the next reward.</p>
<p>Your referral link: <a href="${esc(referralLink(code))}">${esc(referralLink(code))}</a></p>
${contactLine()}`
  );
  return { subject, html };
}

/** Admin: a new lead came in from the website. */
export function adminNewLead(lead: Lead): EmailTemplateResult {
  const subject = `New lead ${lead.lead_id} — ${lead.full_name} (${lead.insurance_type})`;
  const html = emailShell(
    "New lead received",
    `<p>A new enquiry came in from the website. Please contact the customer at the earliest.</p>
${row("Lead ID", lead.lead_id)}
${row("Name", lead.full_name)}
${row("Mobile", lead.mobile)}
${row("Email", lead.email)}
${row("City", lead.city)}
${row("State", lead.state)}
${row("Occupation", lead.occupation)}
${row("Annual income", lead.annual_income)}
${row("Insurance type", lead.insurance_type)}
${row("Coverage", lead.coverage)}
${row("Existing policy number", lead.policy_number)}
${row("Referred by code", lead.referral_code)}
${lead.notes ? row("Notes", lead.notes) : ""}
<p>Admin: ${esc(ADMIN_EMAIL)}</p>`
  );
  return { subject, html };
}

/** Admin: a referral was recorded. */
export function adminNewReferral(referral: Referral): EmailTemplateResult {
  const subject = `New referral ${referral.code} — CreditGuru Insurance`;
  const html = emailShell(
    "New referral recorded",
    `${row("Referral code", referral.code)}
${row("Referrer", referral.referrer_name)}
${row("Referrer email", referral.referrer_email)}
${row("Referred person", referral.referred_name)}
${row("Referred email", referral.referred_email)}
${row("Status", referral.status)}
${row("Reward tier", referral.reward_tier)}
<p>Admin: ${esc(ADMIN_EMAIL)}</p>`
  );
  return { subject, html };
}

/** Admin: a policy was purchased / recorded in the tracker. */
export function adminPolicyPurchased(policy: Policy): EmailTemplateResult {
  const subject = `Policy purchased — ${policy.policy_number} (${policy.customer_name})`;
  const html = emailShell(
    "Policy purchased",
    `<p>A policy has been recorded in the policy tracker.</p>
${row("Policy number", policy.policy_number)}
${row("Company", policy.company_name)}
${row("Bought from", policy.source_website)}
${row("Product", policy.product_type)}
${row("Customer", policy.customer_name)}
${row("Customer email", policy.customer_email)}
${row("Customer mobile", policy.customer_mobile)}
${row("Premium", policy.premium_amount ? `₹${esc(policy.premium_amount)}` : null)}
${row("Coverage", policy.coverage_amount)}
${row("Start date", policy.start_date)}
${row("Expiry date", policy.expiry_date)}
${row("Status", policy.status)}
${policy.notes ? row("Notes", policy.notes) : ""}
<p>Admin: ${esc(ADMIN_EMAIL)}</p>`
  );
  return { subject, html };
}

/** Admin: a customer raised a claim request. */
export function adminClaimRequest(claim: Claim): EmailTemplateResult {
  const subject = `New claim request — ${claim.customer_name}`;
  const html = emailShell(
    "New claim request",
    `<p>A customer has raised a claim request. Please contact them and guide them through the claim process.</p>
${row("Customer", claim.customer_name)}
${row("Email", claim.customer_email)}
${row("Mobile", claim.customer_mobile)}
${row("Policy ID", claim.policy_id)}
${row("Status", claim.status)}
${row("Description", claim.description)}
<p>Admin: ${esc(ADMIN_EMAIL)}</p>`
  );
  return { subject, html };
}

/** Admin: a policy is coming up for renewal in a window. */
export function adminRenewalDue(
  policy: Policy,
  windowDays: number
): EmailTemplateResult {
  const subject = `Renewal due in ${windowDays} days — ${policy.policy_number} (${policy.customer_name})`;
  const html = emailShell(
    "Renewal due",
    `<p>A tracked policy is coming up for renewal. Please follow up with the customer.</p>
${row("Policy number", policy.policy_number)}
${row("Company", policy.company_name)}
${row("Product", policy.product_type)}
${row("Customer", policy.customer_name)}
${row("Customer email", policy.customer_email)}
${row("Customer mobile", policy.customer_mobile)}
${row("Expiry date", policy.expiry_date)}
${row("Days to expiry", windowDays)}
${row("Premium", policy.premium_amount ? `₹${esc(policy.premium_amount)}` : null)}
<p>Admin: ${esc(ADMIN_EMAIL)}</p>`
  );
  return { subject, html };
}
