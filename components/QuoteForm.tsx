"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";
const labelCls = "mb-1 block text-sm font-medium text-navy";

export default function QuoteForm({
  leadId,
  onCreated,
}: {
  leadId: string;
  onCreated: () => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [policyName, setPolicyName] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [waitingPeriod, setWaitingPeriod] = useState("");
  const [benefits, setBenefits] = useState("");
  const [claimSettlement, setClaimSettlement] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!companyName.trim() || !policyName.trim()) {
      setError("Company Name and Policy Name are required.");
      return;
    }
    const premium = Number(premiumAmount);
    if (!premiumAmount || Number.isNaN(premium) || premium <= 0) {
      setError("Please enter a valid Premium Amount.");
      return;
    }
    if (!coverageAmount.trim()) {
      setError("Coverage Amount is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          company_name: companyName.trim(),
          policy_name: policyName.trim(),
          premium_amount: premium,
          coverage_amount: coverageAmount.trim(),
          waiting_period: waitingPeriod.trim() || undefined,
          benefits: benefits.trim() || undefined,
          claim_settlement: claimSettlement.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not save the quote. Please try again.");
        return;
      }
      setSuccess("Quote saved and sent to the customer.");
      setCompanyName("");
      setPolicyName("");
      setPremiumAmount("");
      setCoverageAmount("");
      setWaitingPeriod("");
      setBenefits("");
      setClaimSettlement("");
      setNotes("");
      onCreated();
    } catch {
      setError("Could not save the quote. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-navy">Create a New Quote</h3>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qf-company" className={labelCls}>
            Company Name *
          </label>
          <input
            id="qf-company"
            type="text"
            className={inputCls}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. HDFC ERGO"
          />
        </div>
        <div>
          <label htmlFor="qf-policy" className={labelCls}>
            Policy Name *
          </label>
          <input
            id="qf-policy"
            type="text"
            className={inputCls}
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            placeholder="e.g. Optima Secure"
          />
        </div>
        <div>
          <label htmlFor="qf-premium" className={labelCls}>
            Premium Amount (₹) *
          </label>
          <input
            id="qf-premium"
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            value={premiumAmount}
            onChange={(e) => setPremiumAmount(e.target.value)}
            placeholder="e.g. 12500"
          />
        </div>
        <div>
          <label htmlFor="qf-coverage" className={labelCls}>
            Coverage Amount *
          </label>
          <input
            id="qf-coverage"
            type="text"
            className={inputCls}
            value={coverageAmount}
            onChange={(e) => setCoverageAmount(e.target.value)}
            placeholder="e.g. ₹10 Lakhs"
          />
        </div>
        <div>
          <label htmlFor="qf-waiting" className={labelCls}>
            Waiting Period
          </label>
          <input
            id="qf-waiting"
            type="text"
            className={inputCls}
            value={waitingPeriod}
            onChange={(e) => setWaitingPeriod(e.target.value)}
            placeholder="e.g. 2 years for pre-existing diseases"
          />
        </div>
        <div>
          <label htmlFor="qf-claim" className={labelCls}>
            Claim Settlement Information
          </label>
          <input
            id="qf-claim"
            type="text"
            className={inputCls}
            value={claimSettlement}
            onChange={(e) => setClaimSettlement(e.target.value)}
            placeholder="e.g. 98% claim settlement ratio"
          />
        </div>
      </div>

      <div>
        <label htmlFor="qf-benefits" className={labelCls}>
          Benefits
        </label>
        <textarea
          id="qf-benefits"
          rows={3}
          className={inputCls}
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
          placeholder="Key benefits of this policy…"
        />
      </div>

      <div>
        <label htmlFor="qf-notes" className={labelCls}>
          Additional Notes
        </label>
        <textarea
          id="qf-notes"
          rows={2}
          className={inputCls}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else the customer should know…"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-deepteal disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save Quote"}
      </button>
    </form>
  );
}
