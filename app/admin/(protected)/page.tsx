"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import QuoteForm from "@/components/QuoteForm";
import { LEAD_STATUSES } from "@/lib/constants";
import type { Lead, LeadStatus, Quote } from "@/lib/types";

interface Metrics {
  total: number;
  new: number;
  quotes_sent: number;
  policies_issued: number;
  pending_follow_ups: number;
  renewals_due: number;
  referral_conversions: number;
  revenue: number;
}

interface LeadDetail {
  lead: Lead;
  family_members: Lead["family_members"];
  quotes: Quote[];
}

const inputCls =
  "rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

function formatDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatRupees(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not load leads.");
        return;
      }
      setLeads(data.leads ?? []);
      setMetrics(data.metrics ?? null);
    } catch {
      setError("Could not load leads. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailError("");
    setDetail(null);
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setDetailError(data.error || "Could not load this lead.");
        return;
      }
      setDetail({
        lead: data.lead,
        family_members: data.family_members ?? data.lead?.family_members ?? [],
        quotes: data.quotes ?? [],
      });
    } catch {
      setDetailError("Could not load this lead. Please try again.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function selectLead(lead: Lead) {
    setSelectedId(lead.id);
    fetchDetail(lead.id);
  }

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== "All" && lead.status !== statusFilter) return false;
      if (!q) return true;
      return (
        lead.full_name.toLowerCase().includes(q) ||
        lead.mobile.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q)
      );
    });
  }, [leads, search, statusFilter]);

  async function handleStatusChange(newStatus: string) {
    if (!detail) return;
    setUpdatingStatus(true);
    setDetailError("");
    try {
      const res = await fetch(`/api/leads/${detail.lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setDetailError(data.error || "Could not update the status.");
        return;
      }
      setDetail((prev) =>
        prev ? { ...prev, lead: { ...prev.lead, status: newStatus as LeadStatus } } : prev
      );
      setLeads((prev) =>
        prev.map((l) =>
          l.id === detail.lead.id ? { ...l, status: newStatus as LeadStatus } : l
        )
      );
    } catch {
      setDetailError("Could not update the status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  const metricCards: { label: string; value: string | number }[] = metrics
    ? [
        { label: "Total Leads", value: metrics.total },
        { label: "New Leads", value: metrics.new },
        { label: "Quotes Sent", value: metrics.quotes_sent },
        { label: "Policies Issued", value: metrics.policies_issued },
        { label: "Pending Follow-Ups", value: metrics.pending_follow_ups },
        { label: "Renewals Due", value: metrics.renewals_due },
        { label: "Referral Conversions", value: metrics.referral_conversions },
        { label: "Revenue Generated", value: formatRupees(metrics.revenue) },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">Advisor Dashboard</h1>
          <p className="mt-1 text-sm text-slategrey">
            Leads, quotes, policies and renewals — all in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/policies"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-deepnavy"
          >
            Policy Tracker
          </Link>
          <Link
            href="/admin/renewals"
            className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-navy hover:opacity-90"
          >
            Renewal Centre
          </Link>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slategrey">Loading dashboard…</p>
      ) : (
        <>
          {metricCards.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {metricCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slategrey">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-navy">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-navy">Lead Management</h2>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                className={`${inputCls} flex-1`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, mobile or email…"
                aria-label="Search leads"
              />
              <select
                className={inputCls}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="All">All statuses</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="font-medium text-navy">No leads yet — new enquiries will appear here.</p>
                <p className="mt-1 text-sm text-slategrey">
                  {search || statusFilter !== "All"
                    ? "Try clearing the search or status filter."
                    : "Share the Get a Free Quote link (creditguruinsurances.com/quote) to start receiving enquiries."}
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Lead ID</th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Insurance Type</th>
                      <th className="px-4 py-3 font-semibold">Mobile</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Coverage</th>
                      <th className="px-4 py-3 font-semibold">Date Created</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => selectLead(lead)}
                        className={`cursor-pointer border-t border-gray-100 hover:bg-mist ${
                          selectedId === lead.id ? "bg-mist" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-teal">
                          {lead.lead_id}
                        </td>
                        <td className="px-4 py-3 font-medium text-navy">{lead.full_name}</td>
                        <td className="px-4 py-3">{lead.insurance_type}</td>
                        <td className="px-4 py-3">{lead.mobile}</td>
                        <td className="px-4 py-3">{lead.email}</td>
                        <td className="px-4 py-3">{lead.coverage}</td>
                        <td className="px-4 py-3">{formatDate(lead.created_at)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-2 text-xs text-slategrey">
              Click a lead to view its full profile, family members and quotes below.
            </p>
          </section>

          {selectedId && (
            <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              {detailLoading && <p className="text-sm text-slategrey">Loading lead details…</p>}
              {detailError && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {detailError}
                </p>
              )}
              {detail && (
                <div className="space-y-8">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-navy">{detail.lead.full_name}</h2>
                        <p className="mt-1 font-mono text-sm font-semibold text-teal">
                          {detail.lead.lead_id}
                        </p>
                      </div>
                      <StatusBadge status={detail.lead.status} />
                    </div>

                    <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <dt className="font-semibold text-navy">Mobile</dt>
                        <dd>{detail.lead.mobile}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Email</dt>
                        <dd className="break-all">{detail.lead.email}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Insurance Type</dt>
                        <dd>{detail.lead.insurance_type}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Coverage</dt>
                        <dd>{detail.lead.coverage}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">City / State</dt>
                        <dd>
                          {[detail.lead.city, detail.lead.state].filter(Boolean).join(", ") ||
                            "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Occupation</dt>
                        <dd>{detail.lead.occupation || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Annual Income</dt>
                        <dd>{detail.lead.annual_income || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Policy Number</dt>
                        <dd className="font-mono">{detail.lead.policy_number || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Existing Policy</dt>
                        <dd>{detail.lead.existing_policy ? "Yes" : "No"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Referral Code</dt>
                        <dd className="font-mono">{detail.lead.referral_code || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-navy">Date Created</dt>
                        <dd>{formatDate(detail.lead.created_at)}</dd>
                      </div>
                    </dl>

                    {detail.lead.notes && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
                        <p className="font-semibold text-navy">Notes</p>
                        <p className="mt-1 whitespace-pre-wrap">{detail.lead.notes}</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <label htmlFor="lead-status" className="text-sm font-semibold text-navy">
                        Change Status
                      </label>
                      <select
                        id="lead-status"
                        className={inputCls}
                        value={detail.lead.status}
                        disabled={updatingStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {updatingStatus && (
                        <span className="text-sm text-slategrey">Updating…</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-navy">Family Members</h3>
                    {!detail.family_members || detail.family_members.length === 0 ? (
                      <p className="mt-2 text-sm text-slategrey">
                        No family members added for this lead.
                      </p>
                    ) : (
                      <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200">
                        {detail.family_members.map((member, i) => (
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
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-navy">Existing Quotes</h3>
                    {detail.quotes.length === 0 ? (
                      <p className="mt-2 text-sm text-slategrey">
                        No quotes sent for this lead yet.
                      </p>
                    ) : (
                      <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead className="bg-gray-50 text-navy">
                            <tr>
                              <th className="px-4 py-2 font-semibold">Company</th>
                              <th className="px-4 py-2 font-semibold">Policy</th>
                              <th className="px-4 py-2 font-semibold">Premium</th>
                              <th className="px-4 py-2 font-semibold">Coverage</th>
                              <th className="px-4 py-2 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.quotes.map((quote) => (
                              <tr key={quote.id} className="border-t border-gray-100">
                                <td className="px-4 py-2 font-medium">{quote.company_name}</td>
                                <td className="px-4 py-2">{quote.policy_name}</td>
                                <td className="px-4 py-2">
                                  {formatRupees(quote.premium_amount)}
                                </td>
                                <td className="px-4 py-2">{quote.coverage_amount}</td>
                                <td className="px-4 py-2">
                                  <StatusBadge status={quote.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <QuoteForm
                      leadId={detail.lead.id}
                      onCreated={() => fetchDetail(detail.lead.id)}
                    />
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
