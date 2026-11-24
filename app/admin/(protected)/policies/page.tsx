"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import PolicyForm from "@/components/PolicyForm";
import { BROKERS, brokerDisplay, POLICY_STATUSES, PRODUCT_TYPES } from "@/lib/constants";
import type { Policy } from "@/lib/types";

const inputCls =
  "rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PolicyTrackerPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/policies");
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not load policies.");
        return;
      }
      setPolicies(data.policies ?? []);
    } catch {
      setError("Could not load policies. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const companies = useMemo(
    () => Array.from(new Set(policies.map((p) => p.company_name))).sort(),
    [policies]
  );
  const sources = useMemo(
    () => Array.from(new Set(policies.map((p) => p.source_website))).sort(),
    [policies]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return policies.filter((p) => {
      if (companyFilter && p.company_name !== companyFilter) return false;
      if (sourceFilter && p.source_website !== sourceFilter) return false;
      if (brokerFilter && p.broker !== brokerFilter) return false;
      if (productFilter && p.product_type !== productFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.policy_number.toLowerCase().includes(q) ||
        p.customer_name.toLowerCase().includes(q) ||
        p.customer_email.toLowerCase().includes(q) ||
        p.customer_mobile.toLowerCase().includes(q) ||
        p.company_name.toLowerCase().includes(q) ||
        brokerDisplay(p).toLowerCase().includes(q)
      );
    });
  }, [policies, search, companyFilter, sourceFilter, brokerFilter, productFilter, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">Policy Tracker</h1>
      <p className="mt-1 text-sm text-slategrey">
        Every policy sold from any website, in one place — with renewal dates and documents.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <PolicyForm onCreated={fetchPolicies} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">
          Tracked Policies {policies.length > 0 && `(${filtered.length})`}
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            type="search"
            className={inputCls}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policy no., customer…"
            aria-label="Search policies"
          />
          <select
            className={inputCls}
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            aria-label="Filter by company"
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className={inputCls}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="Filter by source website"
          >
            <option value="">All source websites</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className={inputCls}
            value={brokerFilter}
            onChange={(e) => setBrokerFilter(e.target.value)}
            aria-label="Filter by broker"
          >
            <option value="">All brokers</option>
            {BROKERS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            className={inputCls}
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            aria-label="Filter by product type"
          >
            <option value="">All product types</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className={inputCls}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {POLICY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slategrey">Loading policies…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="font-medium text-navy">
              No policies tracked yet — add your first policy above.
            </p>
            <p className="mt-1 text-sm text-slategrey">
              {search || companyFilter || sourceFilter || brokerFilter || productFilter || statusFilter
                ? "No policies match the current filters. Try clearing them."
                : "Policies you add here power the renewal reminders — nothing is pre-filled."}
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Policy Number</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Source Website</th>
                  <th className="px-4 py-3 font-semibold">Broker</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Premium</th>
                  <th className="px-4 py-3 font-semibold">Start</th>
                  <th className="px-4 py-3 font-semibold">Expiry</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((policy) => (
                  <tr key={policy.id} className="border-t border-gray-100 hover:bg-mist">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-teal">
                      {policy.policy_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy">{policy.company_name}</td>
                    <td className="px-4 py-3">{policy.source_website}</td>
                    <td className="px-4 py-3">{brokerDisplay(policy)}</td>
                    <td className="px-4 py-3">{policy.product_type}</td>
                    <td className="px-4 py-3">
                      {policy.customer_name}
                      <span className="block text-xs text-slategrey">
                        {policy.customer_mobile}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {policy.premium_amount != null
                        ? `₹${policy.premium_amount.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{formatDate(policy.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(policy.expiry_date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={policy.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
