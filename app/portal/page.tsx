"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { REFERRAL_REWARD_TIERS, referralLink } from "@/lib/constants";
import type { Claim, PortalData, Quote, QuoteStatus, Referral } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";
const labelCls = "mb-1 block text-sm font-medium text-navy";

const QUOTE_ACTIONS: QuoteStatus[] = ["Interested", "Call Me", "Need Another Quote", "Buy Policy"];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CustomerPortalPage() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [data, setData] = useState<PortalData | null>(null);

  const [referralStats, setReferralStats] = useState<{
    code: string | null;
    count: number;
    pending: number;
    successful: number;
    reward_tier: string | null;
    referrals: Referral[];
  } | null>(null);

  const [quoteUpdating, setQuoteUpdating] = useState<string | null>(null);
  const [quoteNotice, setQuoteNotice] = useState("");

  const [claimPolicyId, setClaimPolicyId] = useState("");
  const [claimDescription, setClaimDescription] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  async function fetchReferrals(emailValue: string) {
    try {
      const res = await fetch(`/api/referrals?email=${encodeURIComponent(emailValue)}`);
      const result = await res.json();
      if (res.ok && result.ok) {
        setReferralStats({
          code: result.code ?? null,
          count: result.count ?? 0,
          pending: result.pending ?? 0,
          successful: result.successful ?? 0,
          reward_tier: result.reward_tier ?? null,
          referrals: result.referrals ?? [],
        });
      }
    } catch {
      // Referral stats are a bonus section; the portal still works without them.
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSignInError("");

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setSignInError("Please enter a valid Email ID.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setSignInError("Please enter a valid 10-digit Mobile Number.");
      return;
    }

    setSigningIn(true);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), mobile: mobile.trim() }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setSignInError(
          result.error ||
            "We could not find your details. Please check your Email ID and Mobile Number and try again."
        );
        return;
      }
      setData({
        profile: result.profile,
        family: result.family ?? [],
        quotes: result.quotes ?? [],
        policies: result.policies ?? [],
        documents: result.documents ?? [],
        claims: result.claims ?? [],
        referrals: result.referrals ?? [],
        referral_code: result.referral_code ?? null,
        reward_tier: result.reward_tier ?? null,
      });
      fetchReferrals(email.trim());
    } catch {
      setSignInError("Could not sign you in. Please check your connection and try again.");
    } finally {
      setSigningIn(false);
    }
  }

  function signOut() {
    setData(null);
    setReferralStats(null);
    setEmail("");
    setMobile("");
    setQuoteNotice("");
    setClaimSuccess("");
    setClaimError("");
  }

  async function handleQuoteResponse(quoteId: string, status: QuoteStatus) {
    setQuoteUpdating(quoteId);
    setQuoteNotice("");
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setQuoteNotice(result.error || "Could not save your response. Please try again.");
        return;
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              quotes: prev.quotes.map((q) => (q.id === quoteId ? { ...q, status } : q)),
            }
          : prev
      );
      setQuoteNotice(
        status === "Buy Policy"
          ? "Thank you! Your advisor will call you shortly to complete the purchase."
          : `Noted — "${status}". Your advisor will follow up accordingly.`
      );
    } catch {
      setQuoteNotice("Could not save your response. Please try again.");
    } finally {
      setQuoteUpdating(null);
    }
  }

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setClaimError("");
    setClaimSuccess("");

    if (!claimDescription.trim()) {
      setClaimError("Please describe what happened for your claim.");
      return;
    }

    setClaimSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy_id: claimPolicyId || undefined,
          customer_name: data.profile.full_name,
          customer_email: data.profile.email,
          customer_mobile: data.profile.mobile,
          description: claimDescription.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setClaimError(result.error || "Could not raise the claim. Please try again.");
        return;
      }
      const newClaim: Claim = result.claim;
      if (newClaim) {
        setData((prev) =>
          prev ? { ...prev, claims: [newClaim, ...prev.claims] } : prev
        );
      }
      setClaimSuccess("Your claim has been raised. Our team will assist you with it shortly.");
      setClaimDescription("");
      setClaimPolicyId("");
    } catch {
      setClaimError("Could not raise the claim. Please check your connection and try again.");
    } finally {
      setClaimSubmitting(false);
    }
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Customer Portal</h1>
        <p className="mt-2 text-sm text-slategrey">
          Sign in with the Email ID and Mobile Number from your enquiry to see your quotes,
          policies, documents, claims and rewards.
        </p>
        <form
          onSubmit={handleSignIn}
          className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {signInError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {signInError}
            </p>
          )}
          <div>
            <label htmlFor="portal-email" className={labelCls}>
              Email ID *
            </label>
            <input
              id="portal-email"
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="portal-mobile" className={labelCls}>
              Mobile Number *
            </label>
            <input
              id="portal-mobile"
              type="tel"
              className={inputCls}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>
          <button
            type="submit"
            disabled={signingIn}
            className="w-full rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-deepteal disabled:opacity-50"
          >
            {signingIn ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  const referralCode = referralStats?.code ?? data.referral_code;
  const referralCount = referralStats?.count ?? data.referrals.length;
  const referralPending =
    referralStats?.pending ?? data.referrals.filter((r) => r.status === "Pending").length;
  const referralSuccessful =
    referralStats?.successful ??
    data.referrals.filter((r) => r.status === "Successful").length;
  const rewardTier = referralStats?.reward_tier ?? data.reward_tier;
  const referralList = referralStats?.referrals ?? data.referrals;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">
            Welcome, {data.profile.full_name}
          </h1>
          <p className="mt-1 text-sm text-slategrey">
            Your quotes, policies, documents, claims and rewards — all in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-navy hover:bg-gray-50"
        >
          Sign Out
        </button>
      </div>

      {quoteNotice && (
        <p role="status" className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {quoteNotice}
        </p>
      )}

      <div className="mt-8 space-y-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">My Profile</h2>
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-navy">Name</dt>
              <dd>{data.profile.full_name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Email ID</dt>
              <dd className="break-all">{data.profile.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Mobile Number</dt>
              <dd>{data.profile.mobile}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Policy Number</dt>
              <dd className="font-mono">{data.profile.policy_number || "—"}</dd>
            </div>
          </dl>
          {data.profile.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-semibold text-navy">Notes</p>
              <p className="mt-1 whitespace-pre-wrap">{data.profile.notes}</p>
            </div>
          )}

          <h3 className="mt-6 text-base font-semibold text-navy">Family Members</h3>
          {data.family.length === 0 ? (
            <p className="mt-2 text-sm text-slategrey">No family members added.</p>
          ) : (
            <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {data.family.map((member, i) => (
                <li key={member.id || i} className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-3 text-sm">
                  <span className="font-medium text-navy">{member.name}</span>
                  <span>{member.relationship}</span>
                  <span className="text-slategrey">
                    {member.dob ? formatDate(member.dob) : "DOB not given"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">My Quotes</h2>
          {data.quotes.length === 0 ? (
            <p className="mt-2 text-sm text-slategrey">
              No quotes yet — your advisor will share quotes here after you request one.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {data.quotes.map((quote: Quote) => (
                <div key={quote.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy">
                        {quote.company_name} — {quote.policy_name}
                      </p>
                      <p className="mt-1 text-sm">
                        Premium:{" "}
                        <span className="font-semibold">
                          ₹{quote.premium_amount.toLocaleString("en-IN")}
                        </span>{" "}
                        · Coverage: {quote.coverage_amount}
                      </p>
                      {quote.waiting_period && (
                        <p className="text-sm text-slategrey">
                          Waiting period: {quote.waiting_period}
                        </p>
                      )}
                      {quote.benefits && (
                        <p className="mt-1 text-sm text-slategrey">Benefits: {quote.benefits}</p>
                      )}
                      {quote.claim_settlement && (
                        <p className="text-sm text-slategrey">
                          Claim settlement: {quote.claim_settlement}
                        </p>
                      )}
                      {quote.notes && (
                        <p className="mt-1 text-sm text-slategrey">{quote.notes}</p>
                      )}
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUOTE_ACTIONS.map((action) => (
                      <button
                        key={action}
                        type="button"
                        disabled={quoteUpdating === quote.id || quote.status === action}
                        onClick={() => handleQuoteResponse(quote.id, action)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          quote.status === action
                            ? "bg-teal text-white"
                            : "border border-teal text-teal hover:bg-mist"
                        } disabled:opacity-50`}
                      >
                        {quoteUpdating === quote.id ? "Saving…" : action}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slategrey">
                    Current response: {quote.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">My Policies</h2>
          {data.policies.length === 0 ? (
            <p className="mt-2 text-sm text-slategrey">
              No policies tracked yet — your purchased policies will appear here.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-gray-50 text-navy">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Policy Number</th>
                    <th className="px-4 py-2 font-semibold">Company</th>
                    <th className="px-4 py-2 font-semibold">Product</th>
                    <th className="px-4 py-2 font-semibold">Premium</th>
                    <th className="px-4 py-2 font-semibold">Expiry</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.policies.map((policy) => (
                    <tr key={policy.id} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-mono text-xs font-semibold text-teal">
                        {policy.policy_number}
                      </td>
                      <td className="px-4 py-2 font-medium">{policy.company_name}</td>
                      <td className="px-4 py-2">{policy.product_type}</td>
                      <td className="px-4 py-2">
                        {policy.premium_amount != null
                          ? `₹${policy.premium_amount.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2">{formatDate(policy.expiry_date)}</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={policy.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">My Documents</h2>
          {data.documents.length === 0 ? (
            <p className="mt-2 text-sm text-slategrey">
              No documents uploaded yet.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {data.documents.map((doc) => (
                <li key={doc.id} className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-3 text-sm">
                  <span className="font-medium text-navy">{doc.doc_type}</span>
                  <span>{doc.file_name}</span>
                  <span className="text-slategrey">{formatDate(doc.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">My Claims</h2>
          {data.claims.length === 0 ? (
            <p className="mt-2 text-sm text-slategrey">No claims raised yet.</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {data.claims.map((claim) => (
                <li key={claim.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm">{claim.description}</p>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="mt-2 text-xs text-slategrey">
                    Raised on {formatDate(claim.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleClaimSubmit} className="mt-6 border-t border-gray-100 pt-5">
            <h3 className="text-base font-semibold text-navy">Raise a Claim</h3>
            {claimError && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {claimError}
              </p>
            )}
            {claimSuccess && (
              <p role="status" className="mt-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {claimSuccess}
              </p>
            )}
            <div className="mt-3">
              <label htmlFor="claim-policy" className={labelCls}>
                Policy (if this claim is for a specific policy)
              </label>
              <select
                id="claim-policy"
                className={inputCls}
                value={claimPolicyId}
                onChange={(e) => setClaimPolicyId(e.target.value)}
              >
                <option value="">Select a policy (optional)</option>
                {data.policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.policy_number} — {policy.company_name} ({policy.product_type})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label htmlFor="claim-description" className={labelCls}>
                What happened? *
              </label>
              <textarea
                id="claim-description"
                rows={3}
                className={inputCls}
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                placeholder="Describe the incident or hospitalisation, with dates if you know them…"
              />
            </div>
            <button
              type="submit"
              disabled={claimSubmitting}
              className="mt-3 rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-deepteal disabled:opacity-50"
            >
              {claimSubmitting ? "Raising claim…" : "Raise Claim"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">My Referrals &amp; Rewards</h2>
          {referralCode ? (
            <div className="mt-4 rounded-xl bg-mist p-4">
              <p className="text-sm">
                <span className="font-semibold text-navy">Your referral code: </span>
                <span className="font-mono font-bold text-teal">{referralCode}</span>
              </p>
              <p className="mt-1 text-sm">
                <span className="font-semibold text-navy">Your referral link: </span>
                <a
                  href={referralLink(referralCode)}
                  className="break-all font-medium text-teal underline"
                >
                  {referralLink(referralCode)}
                </a>
              </p>
              <p className="mt-1 text-sm text-ink">
                Share this link with friends and family — when they buy a policy through it, it
                counts towards your rewards.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slategrey">
              You don&apos;t have a referral code yet — ask your advisor and one will be created
              for you.
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-2xl font-bold text-navy">{referralCount}</p>
              <p className="text-xs text-slategrey">Total Referrals</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-2xl font-bold text-amber">{referralPending}</p>
              <p className="text-xs text-slategrey">Pending</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-2xl font-bold text-teal">{referralSuccessful}</p>
              <p className="text-xs text-slategrey">Successful</p>
            </div>
          </div>

          {rewardTier && (
            <p className="mt-3 text-sm">
              <span className="font-semibold text-navy">Your current reward tier: </span>
              <span className="font-semibold text-amber">{rewardTier}</span>
            </p>
          )}

          {referralList.length > 0 && (
            <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {referralList.map((ref) => (
                <li key={ref.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className="font-medium text-navy">
                    {ref.referred_name || ref.referred_email || "Referred friend"}
                  </span>
                  <StatusBadge status={ref.status} />
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-6 text-base font-semibold text-navy">Reward Tiers</h3>
          <p className="mt-1 text-sm text-slategrey">
            Earn rewards when friends buy a policy through your referral link.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REFERRAL_REWARD_TIERS.map((tier) => (
              <div
                key={tier.policies}
                className="rounded-xl border border-amber/40 bg-amber/10 p-4 text-center"
              >
                <p className="text-2xl font-bold text-navy">{tier.policies}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slategrey">
                  {tier.policies === 1 ? "Policy" : "Policies"}
                </p>
                <p className="mt-1 text-sm font-semibold text-navy">{tier.reward}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
