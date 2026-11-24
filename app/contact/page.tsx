"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { EMAIL, PHONE, PHONE_TEL, SERVICE_AREA, whatsappLink } from "@/lib/constants";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorText("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const detail =
          data && typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again or reach us on WhatsApp.";
        setErrorText(detail);
        setStatus("error");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMobile("");
      setMessage("");
    } catch {
      setErrorText("Could not send your message. Please try again or reach us on WhatsApp.");
      setStatus("error");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/30";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-navy">Contact Us</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink/70">
        Have a question about insurance, a claim, or a renewal? Send us a message and we will
        get back to you. You can also reach us directly on phone, email or WhatsApp.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
          {status === "success" ? (
            <div className="rounded-xl bg-mist p-6 text-center">
              <p className="text-2xl" aria-hidden="true">✓</p>
              <h2 className="mt-2 text-xl font-bold text-navy">Thank you! Your message has been sent.</h2>
              <p className="mt-2 text-ink/70">
                We will get back to you soon. For anything urgent, message us on WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-4 font-semibold text-teal hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="text-xl font-bold text-navy">Send us a message</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-ink">
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-ink">
                    Email ID *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-mobile" className="mb-1 block text-sm font-medium text-ink">
                    Mobile Number *
                  </label>
                  <input
                    id="contact-mobile"
                    type="tel"
                    required
                    pattern="[0-9+ -]{10,15}"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={inputCls}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-ink">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={inputCls}
                    placeholder="Tell us what you need help with…"
                  />
                </div>
              </div>
              {status === "error" && (
                <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {errorText}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-6 w-full rounded-full bg-teal py-3 font-semibold text-white transition hover:bg-deepteal disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>

        {/* Contact details */}
        <div>
          <div className="rounded-2xl bg-navy p-8 text-white">
            <h2 className="text-xl font-bold">Reach Us Directly</h2>
            <ul className="mt-5 space-y-4">
              <li>
                <p className="text-sm uppercase tracking-wider text-teal-300">Phone</p>
                <a href={PHONE_TEL} className="text-lg font-semibold hover:underline">
                  {PHONE}
                </a>
              </li>
              <li>
                <p className="text-sm uppercase tracking-wider text-teal-300">Email</p>
                <a href={`mailto:${EMAIL}`} className="text-lg font-semibold hover:underline">
                  {EMAIL}
                </a>
              </li>
              <li>
                <p className="text-sm uppercase tracking-wider text-teal-300">Service Area</p>
                <p className="text-lg font-semibold">{SERVICE_AREA}</p>
              </li>
            </ul>
            <a
              href={whatsappLink("Hi, I need help with insurance.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:brightness-95"
            >
              Chat on WhatsApp
            </a>
          </div>
          <div className="mt-6 rounded-2xl bg-mist p-6">
            <h2 className="text-lg font-bold text-navy">What happens next?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              Once you send a message or request a quote, we will contact you to understand your
              needs, compare suitable plans, and share a quote. There is no obligation to buy —
              and if a plan is not right for you, we will tell you so.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
