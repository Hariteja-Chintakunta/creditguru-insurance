// Shared TypeScript types for CreditGuru Insurance.
// Column names match supabase/migrations/001_init.sql.

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Documents Pending"
  | "Documents Received"
  | "Quote Sent"
  | "Negotiation"
  | "Purchased"
  | "Lost";

export type QuoteStatus =
  | "Sent"
  | "Interested"
  | "Call Me"
  | "Need Another Quote"
  | "Buy Policy";

export type PolicyStatus =
  | "Active"
  | "Renewal Due"
  | "Expired"
  | "Lapsed"
  | "Claimed";

export type ClaimStatus =
  | "Submitted"
  | "Under Review"
  | "Additional Documents Required"
  | "Approved"
  | "Closed";

export interface FamilyMember {
  id?: string;
  lead_id?: string;
  name: string;
  dob: string;
  relationship: string;
}

export interface Lead {
  id: string;
  lead_id: string;
  full_name: string;
  mobile: string;
  email: string;
  city: string | null;
  state: string | null;
  occupation: string | null;
  annual_income: string | null;
  insurance_type: string;
  coverage: string;
  policy_number: string | null;
  existing_policy: boolean;
  notes: string | null;
  status: LeadStatus;
  referral_code: string | null;
  created_at: string;
  family_members?: FamilyMember[];
}

export interface Quote {
  id: string;
  lead_id: string;
  company_name: string;
  policy_name: string;
  premium_amount: number;
  coverage_amount: string;
  waiting_period: string | null;
  benefits: string | null;
  claim_settlement: string | null;
  notes: string | null;
  status: QuoteStatus;
  created_at: string;
}

export interface Policy {
  id: string;
  policy_number: string;
  company_name: string;
  source_website: string;
  broker: string | null;
  broker_other: string | null;
  product_type: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  premium_amount: number | null;
  coverage_amount: string | null;
  start_date: string | null;
  expiry_date: string | null;
  status: PolicyStatus;
  notes: string | null;
  created_at: string;
}

export interface PolicyDocument {
  id: string;
  policy_id: string | null;
  lead_id: string | null;
  doc_type: string;
  file_name: string;
  storage_path: string | null;
  created_at: string;
}

export interface Claim {
  id: string;
  policy_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  description: string;
  status: ClaimStatus;
  created_at: string;
}

export interface Referral {
  id: string;
  code: string;
  referrer_name: string | null;
  referrer_email: string | null;
  referred_email: string | null;
  referred_name: string | null;
  status: "Pending" | "Successful";
  reward_tier: string | null;
  created_at: string;
}

export interface RenewalReminder {
  id: string;
  policy_id: string;
  window_days: number;
  channel: "Email" | "SMS" | "WhatsApp";
  sent_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  template: string;
  subject: string;
  status: "sent" | "logged" | "failed";
  created_at: string;
}

export interface PortalData {
  profile: {
    full_name: string;
    email: string;
    mobile: string;
    policy_number: string | null;
    notes: string | null;
  };
  family: FamilyMember[];
  quotes: Quote[];
  policies: Policy[];
  documents: PolicyDocument[];
  claims: Claim[];
  referrals: Referral[];
  referral_code: string | null;
  reward_tier: string | null;
}
