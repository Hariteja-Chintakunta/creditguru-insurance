// Referral codes: "HARI" + 4 digits (e.g. HARI1001), unique per customer.
// Uniqueness is checked against the referrals table by the caller.

import { getSupabaseAdmin } from "./supabase-server";

function randomCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `HARI${digits}`;
}

export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    try {
      const { data } = await getSupabaseAdmin()
        .from("referrals")
        .select("id")
        .eq("code", code)
        .maybeSingle();
      if (!data) return code;
    } catch {
      return code;
    }
  }
  // Extremely unlikely fallback: timestamp-based suffix.
  return `HARI${String(Date.now()).slice(-4)}`;
}

export function rewardTierForPolicies(successfulCount: number): string | null {
  if (successfulCount >= 10) return "VIP Reward Package";
  if (successfulCount >= 5) return "Gold Member Reward";
  if (successfulCount >= 3) return "Premium Gift";
  if (successfulCount >= 1) return "Surprise Gift";
  return null;
}
