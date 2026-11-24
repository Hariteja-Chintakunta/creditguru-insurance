import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insurance Products — CreditGuru Insurance",
  description:
    "Health, Life, Term, Savings, Motor and Commercial insurance from CreditGuru Insurance, Hyderabad.",
};

export interface FaqItem {
  q: string;
  a: string;
}

export interface ProductPageProps {
  title: string;
  intro: string;
  plans: { name: string; desc: string }[];
  benefits: string[];
  whyBuy: string[];
  faqs: FaqItem[];
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-navy">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ProductPageLayout({
  title,
  intro,
  plans,
  benefits,
  whyBuy,
  faqs,
}: ProductPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/#products" className="text-sm font-semibold text-teal hover:underline">
        ← All Products
      </Link>
      <h1 className="mt-4 text-4xl font-bold text-navy">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink/80">{intro}</p>

      <Section title="Plans We Offer">
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-2xl bg-mist p-6 ring-1 ring-teal/20">
              <h3 className="text-lg font-bold text-navy">{plan.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{plan.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Key Benefits">
        <ul className="space-y-3">
          {benefits.map((b) => (
            <li key={b} className="flex gap-3 leading-relaxed text-ink/80">
              <span className="text-teal" aria-hidden="true">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Why Buy From CreditGuru Insurance?">
        <ul className="space-y-3">
          {whyBuy.map((w) => (
            <li key={w} className="flex gap-3 leading-relaxed text-ink/80">
              <span className="text-amber" aria-hidden="true">★</span>
              {w}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Frequently Asked Questions">
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="rounded-xl bg-white p-4 ring-1 ring-gray-200 [&_summary]:cursor-pointer"
            >
              <summary className="font-semibold text-navy">{faq.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{faq.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <section className="mt-12 rounded-2xl bg-navy p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Get a free quote for {title}</h2>
        <p className="mt-2 text-white/80">
          Tell us a little about yourself and we will compare plans and send you a quote —
          no obligation, no pressure.
        </p>
        <Link
          href="/quote"
          className="mt-6 inline-block rounded-full bg-amber px-8 py-3 font-semibold text-navy transition hover:bg-amber-400"
        >
          Get a Free Quote
        </Link>
      </section>
    </div>
  );
}
