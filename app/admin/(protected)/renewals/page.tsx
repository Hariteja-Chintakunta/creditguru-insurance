"use client";

import { useCallback, useEffect, useState } from "react";
import { RENEWAL_WINDOWS, brokerDisplay } from "@/lib/constants";
import type { Policy, RenewalReminder } from "@/lib/types";

type Channel = "Email" | "SMS" | "WhatsApp";
const CHANNELS: Channel[] = ["Email", "SMS", "WhatsApp"];

interface RenewalWindow {
  window_days: number;
  policies: (Policy & { days_left?: number })[];
}

interface RenewalLogEntry extends RenewalReminder {
  policy_number?: string;
  customer_name?: string;
  company_name?: string;
  broker?: string | null;
  broker_other?: string | null;
}

function daysLeft(expiry: string | null): number | null {
  if (!expiry) return null;
  const ms = new Date(expiry).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function RenewalCentrePage() {
  const [windows, setWindows] = useState<RenewalWindow[]>([]);
  const [log, setLog] = useState<RenewalLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const [sweeping, setSweeping] = useState(false);

  const fetchRenewals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/renewals");
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not load renewals.");
        return;
      }
      setWindows(data.windows ?? []);
      setLog(data.log ?? []);
    } catch {
      setError("Could not load renewals. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRenewals();
  }, [fetchRenewals]);

  async function sendReminder(body: Record<string, unknown>, key: string) {
    setSendingKey(key);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/renewals/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Reminder could not be sent. Please try again.");
        return;
      }
      const count = typeof data.sent === "number" ? data.sent : 1;
      setNotice(
        count > 1
          ? `${count} renewal reminders sent.`
          : "Renewal reminder sent."
      );
      fetchRenewals();
    } catch {
      setError("Reminder could not be sent. Please check your connection and try again.");
    } finally {
      setSendingKey(null);
    }
  }

  async function runSweep() {
    setSweeping(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/renewals/sweep", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Automatic sweep could not run. Please try again.");
        return;
      }
      const count = typeof data.created === "number" ? data.created : 0;
      setNotice(
        count > 0
          ? `Automatic sweep complete — ${count} reminder${count === 1 ? "" : "s"} created for policies due in a renewal window.`
          : "Automatic sweep complete — no policies are due in a renewal window right now."
      );
      fetchRenewals();
    } catch {
      setError("Automatic sweep could not run. Please check your connection and try again.");
    } finally {
      setSweeping(false);
    }
  }

  const totalDue = windows.reduce((sum, w) => sum + w.policies.length, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">Renewal Reminder Centre</h1>
      <p className="mt-2 max-w-3xl text-sm text-slategrey sm:text-base">
        Reminders are sent only for real tracked policies — policies you have added in the Policy
        Tracker. Nothing here is invented: a client appears below only when their policy expiry
        falls inside a reminder window.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runSweep}
          disabled={sweeping}
          className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-deepteal disabled:opacity-50"
        >
          {sweeping ? "Running sweep…" : "Run automatic sweep"}
        </button>
        <p className="text-sm text-slategrey">
          The sweep checks every tracked policy and creates reminders for the 90 / 60 / 30 / 15 /
          7-day windows before expiry.
        </p>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-slategrey">Loading renewals…</p>
      ) : totalDue === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="font-medium text-navy">
            No renewals due — no tracked policies fall inside a reminder window.
          </p>
          <p className="mt-1 text-sm text-slategrey">
            Add policies with expiry dates in the Policy Tracker and they will appear here 90, 60,
            30, 15 and 7 days before expiry.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {RENEWAL_WINDOWS.map((windowDays) => {
            const windowData = windows.find((w) => w.window_days === windowDays);
            const policies = windowData?.policies ?? [];
            return (
              <section
                key={windowDays}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-navy">
                    {windowDays} days before expiry
                    <span className="ml-2 rounded-full bg-amber/15 px-2.5 py-0.5 text-xs font-bold text-amber">
                      {policies.length} {policies.length === 1 ? "policy" : "policies"}
                    </span>
                  </h2>
                  {policies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {CHANNELS.map((channel) => {
                        const key = `window-${windowDays}-${channel}`;
                        return (
                          <button
                            key={channel}
                            type="button"
                            disabled={sendingKey !== null}
                            onClick={() =>
                              sendReminder({ window_days: windowDays, channel }, key)
                            }
                            className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-deepnavy disabled:opacity-50"
                          >
                            {sendingKey === key ? "Sending…" : `Send to all via ${channel}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {policies.length === 0 ? (
                  <p className="mt-3 text-sm text-slategrey">
                    No policies due in this window.
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full min-w-[860px] text-left text-sm">
                      <thead className="bg-gray-50 text-navy">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Client</th>
                          <th className="px-4 py-2 font-semibold">Policy Number</th>
                          <th className="px-4 py-2 font-semibold">Company</th>
                          <th className="px-4 py-2 font-semibold">Broker</th>
                          <th className="px-4 py-2 font-semibold">Expiry Date</th>
                          <th className="px-4 py-2 font-semibold">Days Left</th>
                          <th className="px-4 py-2 font-semibold">Send Reminder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policies.map((policy) => {
                          const left =
                            policy.days_left ?? daysLeft(policy.expiry_date);
                          return (
                            <tr key={policy.id} className="border-t border-gray-100">
                              <td className="px-4 py-3 font-medium text-navy">
                                {policy.customer_name}
                                <span className="block text-xs font-normal text-slategrey">
                                  {policy.customer_mobile}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-semibold text-teal">
                                {policy.policy_number}
                              </td>
                              <td className="px-4 py-3">{policy.company_name}</td>
                              <td className="px-4 py-3">{brokerDisplay(policy)}</td>
                              <td className="px-4 py-3">{formatDate(policy.expiry_date)}</td>
                              <td className="px-4 py-3">
                                {left == null ? (
                                  "—"
                                ) : left <= 0 ? (
                                  <span className="font-semibold text-red-600">
                                    {left === 0 ? "Expires today" : `Overdue by ${-left} days`}
                                  </span>
                                ) : (
                                  <span className="font-semibold text-amber">{left} days</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {CHANNELS.map((channel) => {
                                    const key = `${policy.id}-${channel}`;
                                    return (
                                      <button
                                        key={channel}
                                        type="button"
                                        disabled={sendingKey !== null}
                                        onClick={() =>
                                          sendReminder({ policy_id: policy.id, channel }, key)
                                        }
                                        className="rounded-lg border border-teal px-2.5 py-1.5 text-xs font-semibold text-teal hover:bg-mist disabled:opacity-50"
                                      >
                                        {sendingKey === key ? "Sending…" : channel}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">Sent Log</h2>
        {log.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-slategrey">
            No reminders sent yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sent At</th>
                  <th className="px-4 py-3 font-semibold">Client / Policy</th>
                  <th className="px-4 py-3 font-semibold">Broker</th>
                  <th className="px-4 py-3 font-semibold">Window</th>
                  <th className="px-4 py-3 font-semibold">Channel</th>
                </tr>
              </thead>
              <tbody>
                {log.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{formatDateTime(entry.sent_at)}</td>
                    <td className="px-4 py-3">
                      {entry.customer_name || entry.policy_number || entry.policy_id}
                    </td>
                    <td className="px-4 py-3">
                      {brokerDisplay({
                        broker: entry.broker ?? null,
                        broker_other: entry.broker_other ?? null,
                      })}
                    </td>
                    <td className="px-4 py-3">{entry.window_days} days</td>
                    <td className="px-4 py-3">{entry.channel}</td>
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
