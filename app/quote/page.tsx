"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  COVERAGES,
  EMAIL,
  INSURANCE_TYPES,
  PHONE_DISPLAY,
  RELATIONSHIPS,
  referralLink,
} from "@/lib/constants";

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";
const labelCls = "mb-1 block text-sm font-medium text-navy";

interface FamilyRow {
  name: string;
  dob: string;
  relationship: string;
}

function QuoteFormPage() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [occupation, setOccupation] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [insuranceType, setInsuranceType] = useState("");
  const [coverage, setCoverage] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyRow[]>([]);
  const [hasExistingPolicy, setHasExistingPolicy] = useState("No");
  const [existingPolicyDocName, setExistingPolicyDocName] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    leadId: string;
    referralCode: string;
  } | null>(null);

  function updateFamily(index: number, field: keyof FamilyRow, value: string) {
    setFamilyMembers((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addFamilyMember() {
    setFamilyMembers((prev) => [...prev, { name: "", dob: "", relationship: "Self" }]);
  }

  function removeFamilyMember(index: number) {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setExistingPolicyDocName(file ? file.name : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setErrors([]);

    const errs: string[] = [];
    if (!fullName.trim()) errs.push("Full Name is required.");
    if (!/^[6-9]\d{9}$/.test(mobile.trim()))
      errs.push("Please enter a valid 10-digit Indian Mobile Number.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      errs.push("Please enter a valid Email ID.");
    if (!insuranceType) errs.push("Please choose an Insurance Type.");
    if (!coverage) errs.push("Please choose a Coverage amount.");
    familyMembers.forEach((m, i) => {
      if (m.name.trim() && !m.dob) {
        errs.push(`Family member ${i + 1}: please add a Date of Birth.`);
      }
      if (!m.name.trim() && m.dob) {
        errs.push(`Family member ${i + 1}: please add a Name.`);
      }
    });
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          occupation: occupation.trim() || undefined,
          annual_income: annualIncome.trim() || undefined,
          insurance_type: insuranceType,
          coverage,
          policy_number: policyNumber.trim() || undefined,
          existing_policy: hasExistingPolicy === "Yes",
          existing_policy_doc_name: existingPolicyDocName || undefined,
          notes: notes.trim() || undefined,
          referred_by: refCode || undefined,
          family_members: familyMembers
            .filter((m) => m.name.trim())
            .map((m) => ({
              name: m.name.trim(),
              dob: m.dob,
              relationship: m.relationship,
            })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSuccess({ leadId: data.lead_id, referralCode: data.referral_code });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Could not submit your request. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const link = success.referralCode ? referralLink(success.referralCode) : "";
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-teal/30 bg-mist p-8 text-center shadow-sm">
          <p className="text-4xl">✓</p>
          <h1 className="mt-3 text-2xl font-bold text-navy sm:text-3xl">
            Thank you! Your request has been received.
          </h1>
          <p className="mt-3 text-sm text-ink sm:text-base">
            Our advisor will call you shortly to discuss the best plan for you. You can reach us
            anytime at {PHONE_DISPLAY} or {EMAIL}.
          </p>
          <div className="mx-auto mt-6 max-w-md space-y-2 rounded-xl bg-white p-5 text-left shadow-sm">
            <p className="text-sm">
              <span className="font-semibold text-navy">Your Lead ID: </span>
              <span className="font-mono font-bold text-teal">{success.leadId}</span>
            </p>
            {success.referralCode && (
              <>
                <p className="text-sm">
                  <span className="font-semibold text-navy">Your Referral Code: </span>
                  <span className="font-mono font-bold text-teal">{success.referralCode}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-navy">Your Referral Link: </span>
                  <a href={link} className="break-all font-medium text-teal underline">
                    {link}
                  </a>
                </p>
              </>
            )}
          </div>
          <div className="mt-6 rounded-xl border border-amber bg-amber/10 p-4 text-left">
            <p className="font-semibold text-navy">Refer friends and get rewarded!</p>
            <p className="mt-1 text-sm text-ink">
              Share your referral link with family and friends. When they buy a policy through
              your link, you move up the rewards ladder — 1 policy earns a Surprise Gift, 3 a
              Premium Gift, 5 a Gold Member Reward, and 10 a VIP Reward Package.
            </p>
          </div>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-deepteal"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">Get a Free Quote</h1>
      <p className="mt-2 text-sm text-slategrey sm:text-base">
        Tell us a little about yourself and we will call you back with the best plan for you and
        your family — no obligation, no spam.
      </p>
      {refCode && (
        <p className="mt-3 rounded-lg bg-amber/10 px-4 py-2 text-sm font-medium text-navy">
          You were referred by a friend (code: {refCode}). Your referral will be recorded with
          this enquiry.
        </p>
      )}

      {errors.length > 0 && (
        <div role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3">
          <p className="font-semibold text-red-700">Please fix the following:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {submitError && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">Your Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="q-name" className={labelCls}>
                Full Name *
              </label>
              <input
                id="q-name"
                type="text"
                className={inputCls}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
              />
            </div>
            <div>
              <label htmlFor="q-mobile" className={labelCls}>
                Mobile Number *
              </label>
              <input
                id="q-mobile"
                type="tel"
                className={inputCls}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label htmlFor="q-email" className={labelCls}>
                Email ID *
              </label>
              <input
                id="q-email"
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="q-city" className={labelCls}>
                City
              </label>
              <input
                id="q-city"
                type="text"
                className={inputCls}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad"
              />
            </div>
            <div>
              <label htmlFor="q-state" className={labelCls}>
                State
              </label>
              <input
                id="q-state"
                type="text"
                className={inputCls}
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Telangana"
              />
            </div>
            <div>
              <label htmlFor="q-occupation" className={labelCls}>
                Occupation
              </label>
              <input
                id="q-occupation"
                type="text"
                className={inputCls}
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="q-income" className={labelCls}>
                Annual Income
              </label>
              <input
                id="q-income"
                type="text"
                className={inputCls}
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="e.g. ₹12,00,000"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">Insurance You Need</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="q-type" className={labelCls}>
                Insurance Type *
              </label>
              <select
                id="q-type"
                className={inputCls}
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value)}
              >
                <option value="">Select insurance type</option>
                {INSURANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="q-coverage" className={labelCls}>
                Coverage *
              </label>
              <select
                id="q-coverage"
                className={inputCls}
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
              >
                <option value="">Select coverage</option>
                {COVERAGES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="q-policynumber" className={labelCls}>
                Policy Number (if you already have one)
              </label>
              <input
                id="q-policynumber"
                type="text"
                className={inputCls}
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="Your existing policy number, if any"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">Family Members</h2>
          <p className="mt-1 text-sm text-slategrey">
            Add the family members you want covered under this policy (optional).
          </p>
          {familyMembers.length === 0 && (
            <p className="mt-3 text-sm text-slategrey">No family members added yet.</p>
          )}
          <div className="mt-4 space-y-4">
            {familyMembers.map((member, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
              >
                <div>
                  <label htmlFor={`q-fam-name-${index}`} className={labelCls}>
                    Name
                  </label>
                  <input
                    id={`q-fam-name-${index}`}
                    type="text"
                    className={inputCls}
                    value={member.name}
                    onChange={(e) => updateFamily(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`q-fam-dob-${index}`} className={labelCls}>
                    Date of Birth
                  </label>
                  <input
                    id={`q-fam-dob-${index}`}
                    type="date"
                    className={inputCls}
                    value={member.dob}
                    onChange={(e) => updateFamily(index, "dob", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`q-fam-rel-${index}`} className={labelCls}>
                    Relationship
                  </label>
                  <select
                    id={`q-fam-rel-${index}`}
                    className={inputCls}
                    value={member.relationship}
                    onChange={(e) => updateFamily(index, "relationship", e.target.value)}
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeFamilyMember(index)}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFamilyMember}
            className="mt-4 rounded-lg border border-teal px-4 py-2 text-sm font-semibold text-teal hover:bg-mist"
          >
            + Add Family Member
          </button>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-navy">Existing Policy</h2>
          <div className="mt-4">
            <span className={labelCls}>Do you already have an insurance policy?</span>
            <div className="mt-1 flex gap-6">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="existing-policy"
                    value={option}
                    checked={hasExistingPolicy === option}
                    onChange={() => setHasExistingPolicy(option)}
                    className="h-4 w-4 accent-teal"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          {hasExistingPolicy === "Yes" && (
            <div className="mt-4">
              <label htmlFor="q-doc" className={labelCls}>
                Upload your existing policy document (optional)
              </label>
              <input
                id="q-doc"
                type="file"
                className="w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal"
                onChange={handleFileChange}
              />
              {existingPolicyDocName && (
                <p className="mt-1 text-xs text-slategrey">Selected: {existingPolicyDocName}</p>
              )}
            </div>
          )}
          <div className="mt-4">
            <label htmlFor="q-notes" className={labelCls}>
              Additional Notes
            </label>
            <textarea
              id="q-notes"
              rows={3}
              className={inputCls}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else we should know? (medical history, preferred company, budget…)"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-teal px-6 py-3 text-base font-semibold text-white hover:bg-deepteal disabled:opacity-50 sm:w-auto"
        >
          {submitting ? "Submitting…" : "Get My Free Quote"}
        </button>
        <p className="text-xs text-slategrey">
          By submitting, you agree to be contacted by CreditGuru Insurance on the mobile number
          and email ID above regarding your enquiry.
        </p>
      </form>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-14">
          <p className="text-sm text-slategrey">Loading the quote form…</p>
        </div>
      }
    >
      <QuoteFormPage />
    </Suspense>
  );
}
