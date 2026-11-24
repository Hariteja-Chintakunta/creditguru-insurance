import Link from "next/link";
import type { Metadata } from "next";
import { EMAIL, EXPERIENCE_TEXT, PHONE, PHONE_TEL, PRINCIPLE, whatsappLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us — CreditGuru Insurance, Hyderabad",
  description:
    "CreditGuru Insurance, Hyderabad — an insurance advisor with more than 7 years of experience, guiding families and businesses to the right policy and standing by them through claims.",
};

const SERVICES = [
  "Health Insurance — individual, family floater, senior citizen and critical illness cover",
  "Life Insurance — whole life and child plans",
  "Term Insurance — pure protection and income protection",
  "Savings Plans — ULIP, endowment, pension and retirement",
  "Motor Insurance — car, bike and commercial vehicle",
  "Commercial Insurance — employee health and group insurance",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-navy">About CreditGuru Insurance</h1>
      <p className="mt-2 text-lg font-semibold text-teal">Securing Life with Good Guidance</p>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-navy">Your Advisor in Hyderabad</h2>
        <p className="mt-3 leading-relaxed text-ink/80">
          CreditGuru Insurance is an insurance advisory based in Hyderabad, Telangana. For{" "}
          {EXPERIENCE_TEXT}, we have helped families and businesses understand insurance in
          simple language, compare plans honestly, and choose the policy that truly fits their
          needs — not the one that pays the highest commission.
        </p>
        <p className="mt-3 leading-relaxed text-ink/80">
          Insurance can feel confusing: too many plans, too much fine print, and too little
          time to read it all. Our job is to make it simple. We listen first, understand your
          family, your income and your goals, and then guide you to the right cover — whether
          it is health insurance for your parents, a term plan to protect your family&apos;s
          income, a savings plan for your child&apos;s future, or motor insurance for your vehicle.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy">What We Do</h2>
        <ul className="mt-4 space-y-3">
          {SERVICES.map((s) => (
            <li key={s} className="flex gap-3 leading-relaxed text-ink/80">
              <span className="text-teal" aria-hidden="true">✓</span>
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-4 leading-relaxed text-ink/80">
          Beyond buying a policy, we help you track your policies, remind you before renewals
          so your cover never lapses, and assist you when you need to make a claim.
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-mist p-8">
        <h2 className="text-2xl font-bold text-navy">Our Principle</h2>
        <blockquote className="mt-3 border-l-4 border-teal pl-4 text-xl italic text-navy">
          &ldquo;{PRINCIPLE}&rdquo;
        </blockquote>
        <p className="mt-4 leading-relaxed text-ink/80">
          That is how we work, every single time. A policy that does not fit your life is not
          a good policy, no matter what it pays us. When you trust us with your family&apos;s
          protection, we earn that trust by putting your needs first.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy">Claims Support</h2>
        <p className="mt-3 leading-relaxed text-ink/80">
          Buying a policy is only the beginning — the real test of insurance comes when you
          need to claim. We stand with our customers through the claim process: helping you
          understand what documents are needed, guiding you through each step, and following
          up until the claim is settled. You do not face the insurer alone.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy">A Customer-First Approach</h2>
        <p className="mt-3 leading-relaxed text-ink/80">
          Every family is different, so every recommendation is different. We take the time to
          explain waiting periods, exclusions, claim settlement and renewal terms in plain
          words before you buy — so there are no surprises later. If a plan is not right for
          you, we will tell you so.
        </p>
        <p className="mt-3 leading-relaxed text-ink/80">
          More than 1000 policies sold and 10,000+ families guided — that trust is built one
          honest conversation at a time.
        </p>
      </section>

      <section className="mt-12 rounded-2xl bg-navy p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Talk to us about your insurance needs</h2>
        <p className="mt-2 text-white/80">
          Call us, email us, or message us on WhatsApp — we will be glad to help.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/quote"
            className="rounded-full bg-amber px-6 py-3 font-semibold text-navy transition hover:bg-amber-400"
          >
            Get a Free Quote
          </Link>
          <a
            href={whatsappLink("Hi, I would like to know more about CreditGuru Insurance.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-teal px-6 py-3 font-semibold text-white transition hover:bg-deepteal"
          >
            WhatsApp Us
          </a>
          <a
            href={PHONE_TEL}
            className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Call {PHONE}
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Email Us
          </a>
        </div>
      </section>
    </div>
  );
}
