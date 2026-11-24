"use client";

import { useState } from "react";
import { BROKERS, DOC_TYPES, POLICY_STATUSES, PRODUCT_TYPES } from "@/lib/constants";

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";
const labelCls = "mb-1 block text-sm font-medium text-navy";

export default function PolicyForm({ onCreated }: { onCreated: () => void }) {
  const [policyNumber, setPolicyNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sourceWebsite, setSourceWebsite] = useState("");
  const [broker, setBroker] = useState("");
  const [brokerOther, setBrokerOther] = useState("");
  const [productType, setProductType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");
  const [docType, setDocType] = useState("Existing Policy");
  const [docFileName, setDocFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setDocFileName(file ? file.name : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !policyNumber.trim() ||
      !companyName.trim() ||
      !sourceWebsite.trim() ||
      !productType ||
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerMobile.trim()
    ) {
      setError(
        "Policy Number, Company, Source Website, Product Type, Customer Name, Email and Mobile are all required."
      );
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
      setError("Please enter a valid customer Email ID.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(customerMobile.trim())) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      const premium = premiumAmount ? Number(premiumAmount) : undefined;
      if (premiumAmount && (Number.isNaN(premium as number) || (premium as number) <= 0)) {
        setError("Please enter a valid Premium Amount.");
        setSubmitting(false);
        return;
      }
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy_number: policyNumber.trim(),
          company_name: companyName.trim(),
          source_website: sourceWebsite.trim(),
          broker: broker || undefined,
          broker_other:
            broker === "Other" && brokerOther.trim()
              ? brokerOther.trim()
              : undefined,
          product_type: productType,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_mobile: customerMobile.trim(),
          premium_amount: premium,
          coverage_amount: coverageAmount.trim() || undefined,
          start_date: startDate || undefined,
          expiry_date: expiryDate || undefined,
          status,
          notes: notes.trim() || undefined,
          document: docFileName
            ? { doc_type: docType, file_name: docFileName }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not save the policy. Please try again.");
        return;
      }
      setSuccess("Policy saved to the tracker.");
      setPolicyNumber("");
      setCompanyName("");
      setSourceWebsite("");
      setBroker("");
      setBrokerOther("");
      setProductType("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerMobile("");
      setPremiumAmount("");
      setCoverageAmount("");
      setStartDate("");
      setExpiryDate("");
      setStatus("Active");
      setNotes("");
      setDocFileName("");
      onCreated();
    } catch {
      setError("Could not save the policy. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-navy">Add a Policy</h2>

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="pf-number" className={labelCls}>
            Policy Number *
          </label>
          <input
            id="pf-number"
            type="text"
            className={inputCls}
            value={policyNumber}
            onChange={(e) => setPolicyNumber(e.target.value)}
            placeholder="e.g. POL12345678"
          />
        </div>
        <div>
          <label htmlFor="pf-company" className={labelCls}>
            Insurance Company *
          </label>
          <input
            id="pf-company"
            type="text"
            className={inputCls}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Star Health"
          />
        </div>
        <div>
          <label htmlFor="pf-source" className={labelCls}>
            Source Website / Portal *
          </label>
          <input
            id="pf-source"
            type="text"
            className={inputCls}
            value={sourceWebsite}
            onChange={(e) => setSourceWebsite(e.target.value)}
            placeholder="e.g. policybazaar.com"
          />
        </div>
        <div>
          <label htmlFor="pf-broker" className={labelCls}>
            Broker
          </label>
          <select
            id="pf-broker"
            className={inputCls}
            value={broker}
            onChange={(e) => {
              setBroker(e.target.value);
              if (e.target.value !== "Other") setBrokerOther("");
            }}
          >
            <option value="">Select broker (optional)</option>
            {BROKERS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        {broker === "Other" && (
          <div>
            <label htmlFor="pf-broker-other" className={labelCls}>
              Broker Name *
            </label>
            <input
              id="pf-broker-other"
              type="text"
              className={inputCls}
              value={brokerOther}
              onChange={(e) => setBrokerOther(e.target.value)}
              placeholder="Type the broker's name"
            />
          </div>
        )}
        <div>
          <label htmlFor="pf-product" className={labelCls}>
            Product Type *
          </label>
          <select
            id="pf-product"
            className={inputCls}
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <option value="">Select product type</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-customer" className={labelCls}>
            Customer Name *
          </label>
          <input
            id="pf-customer"
            type="text"
            className={inputCls}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pf-email" className={labelCls}>
            Customer Email ID *
          </label>
          <input
            id="pf-email"
            type="email"
            className={inputCls}
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pf-mobile" className={labelCls}>
            Customer Mobile Number *
          </label>
          <input
            id="pf-mobile"
            type="tel"
            className={inputCls}
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
            placeholder="10-digit mobile number"
          />
        </div>
        <div>
          <label htmlFor="pf-premium" className={labelCls}>
            Premium Amount (₹)
          </label>
          <input
            id="pf-premium"
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            value={premiumAmount}
            onChange={(e) => setPremiumAmount(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pf-coverage" className={labelCls}>
            Coverage Amount
          </label>
          <input
            id="pf-coverage"
            type="text"
            className={inputCls}
            value={coverageAmount}
            onChange={(e) => setCoverageAmount(e.target.value)}
            placeholder="e.g. ₹10 Lakhs"
          />
        </div>
        <div>
          <label htmlFor="pf-start" className={labelCls}>
            Start Date
          </label>
          <input
            id="pf-start"
            type="date"
            className={inputCls}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pf-expiry" className={labelCls}>
            Expiry Date
          </label>
          <input
            id="pf-expiry"
            type="date"
            className={inputCls}
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pf-status" className={labelCls}>
            Status
          </label>
          <select
            id="pf-status"
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {POLICY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="pf-notes" className={labelCls}>
          Notes
        </label>
        <textarea
          id="pf-notes"
          rows={2}
          className={inputCls}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any extra details about this policy…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-doctype" className={labelCls}>
            Document Type
          </label>
          <select
            id="pf-doctype"
            className={inputCls}
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            {DOC_TYPES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-doc" className={labelCls}>
            Upload Document
          </label>
          <input
            id="pf-doc"
            type="file"
            className="w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal"
            onChange={handleFileChange}
          />
          {docFileName && <p className="mt-1 text-xs text-slategrey">Selected: {docFileName}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-deepteal disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Add Policy"}
      </button>
    </form>
  );
}
