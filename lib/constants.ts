// CreditGuru Insurance — business constants (real details only).
// Nothing here is invented: phone, email, experience and social proof
// are hariteja's own figures. No office street address was provided,
// so only Hyderabad, Telangana is shown as the service area.

export const SITE_NAME = "CreditGuru Insurance";
export const SITE_DOMAIN = "creditguruinsurances.com";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://creditguruinsurances.com";

export const PHONE = "+91 9392961261";
export const PHONE_DISPLAY = "+91 9392961261";
export const PHONE_TEL = "tel:+919392961261";
export const WHATSAPP_NUMBER = "919392961261"; // same mobile number
export const EMAIL = "creditguruservices@gmail.com";
export const ADMIN_EMAIL = "creditguruservices@gmail.com";

export const SERVICE_AREA = "Hyderabad, Telangana";
export const EXPERIENCE_YEARS = "7+";
export const EXPERIENCE_TEXT = "more than 7 years";

export const PRINCIPLE =
  "We work on the relationship with you, not for high commission.";

export const SOCIAL_PROOF = {
  policiesSold: "1000+",
  policiesSoldLabel: "Policies Sold",
  familiesGuided: "10,000+",
  familiesGuidedLabel: "Families Guided",
};

export const INSURANCE_TYPES = [
  "Health Insurance",
  "Life Insurance",
  "Term Insurance",
  "Savings Plan",
  "Car Insurance",
  "Bike Insurance",
  "Commercial Vehicle",
] as const;

export const COVERAGES = [
  "₹5 Lakhs",
  "₹10 Lakhs",
  "₹25 Lakhs",
  "₹50 Lakhs",
  "₹1 Crore",
  "₹2 Crore+",
  "Custom Amount",
] as const;

export const RELATIONSHIPS = [
  "Self",
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Other",
] as const;

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Documents Pending",
  "Documents Received",
  "Quote Sent",
  "Negotiation",
  "Purchased",
  "Lost",
] as const;

export const QUOTE_STATUSES = [
  "Sent",
  "Interested",
  "Call Me",
  "Need Another Quote",
  "Buy Policy",
] as const;

export const POLICY_STATUSES = [
  "Active",
  "Renewal Due",
  "Expired",
  "Lapsed",
  "Claimed",
] as const;

export const PRODUCT_TYPES = [
  "Health",
  "Life",
  "Term",
  "Savings",
  "Car",
  "Bike",
  "Commercial",
] as const;

// Brokers hariteja works with. "Other" takes a free-text broker name
// (broker_other). No broker data is invented — the field is empty until
// the admin records it on a policy.
export const BROKERS = [
  "QuickInsure",
  "PolicyBazaar",
  "InsuranceDekho",
  "Other",
] as const;

/** Display name for a policy's broker: the free-text name when the
 *  broker is "Other", otherwise the broker itself, or "—" when none
 *  was recorded. */
export function brokerDisplay(policy: {
  broker: string | null;
  broker_other: string | null;
}): string {
  if (policy.broker === "Other") {
    return policy.broker_other?.trim() ? policy.broker_other.trim() : "Other";
  }
  return policy.broker?.trim() ? policy.broker.trim() : "—";
}

export const DOC_TYPES = [
  "Aadhaar",
  "PAN",
  "Driving License",
  "RC Book",
  "Existing Policy",
  "Medical Report",
  "Address Proof",
] as const;

export const CLAIM_STATUSES = [
  "Submitted",
  "Under Review",
  "Additional Documents Required",
  "Approved",
  "Closed",
] as const;

export const RENEWAL_WINDOWS = [90, 60, 30, 15, 7] as const;

export const REFERRAL_REWARD_TIERS = [
  { policies: 1, reward: "Surprise Gift" },
  { policies: 3, reward: "Premium Gift" },
  { policies: 5, reward: "Gold Member Reward" },
  { policies: 10, reward: "VIP Reward Package" },
] as const;

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function referralLink(code: string): string {
  return `${SITE_URL}/ref/${code}`;
}
