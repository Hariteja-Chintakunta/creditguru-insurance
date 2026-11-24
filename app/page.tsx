import Link from "next/link";
import {
  EMAIL,
  EXPERIENCE_YEARS,
  PHONE,
  PHONE_TEL,
  REFERRAL_REWARD_TIERS,
  SOCIAL_PROOF,
  whatsappLink,
} from "@/lib/constants";

const PRODUCTS = [
  {
    href: "/products/health",
    icon: "✚",
    title: "Health Insurance",
    desc: "Individual, family floater, senior citizen and critical illness cover for hospital expenses.",
  },
  {
    href: "/products/life",
    icon: "♥",
    title: "Life Insurance",
    desc: "Whole life and child plans that protect your family's future, whatever happens.",
  },
  {
    href: "/products/term",
    icon: "🛡",
    title: "Term Insurance",
    desc: "Pure protection at an affordable premium — high cover for your family's income security.",
  },
  {
    href: "/products/savings",
    icon: "◈",
    title: "Savings Plans",
    desc: "ULIP, endowment, pension and retirement plans that grow your money with protection.",
  },
  {
    href: "/products/motor",
    icon: "🚗",
    title: "Motor Insurance",
    desc: "Car, bike and commercial vehicle insurance — third-party and comprehensive cover.",
  },
  {
    href: "/products/commercial",
    icon: "🏢",
    title: "Commercial Insurance",
    desc: "Employee health and group insurance that protects your team and your business.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
            Securing Life with Good Guidance
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Health, Life, Savings &amp; Vehicle Insurance in One Place
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            CreditGuru Insurance helps families and businesses in Hyderabad choose the right
            policy — clearly explained, honestly compared, and supported through claims and
            renewals. More than 7 years of experience, 1000+ policies sold, 10,000+ families guided.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/quote"
              className="rounded-full bg-amber px-6 py-3 font-semibold text-navy transition hover:bg-amber-400"
            >
              Get Free Quote
            </Link>
            <Link
              href="#products"
              className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Compare Plans
            </Link>
            <a
              href={whatsappLink("Hi, I need help choosing an insurance plan.")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-teal px-6 py-3 font-semibold text-white transition hover:bg-deepteal"
            >
              Talk To Advisor
            </a>
          </div>
        </div>
      </section>

      {/* Highlight cards */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-amber/10 p-8 ring-1 ring-amber/40">
            <p className="text-3xl" aria-hidden="true">🎁</p>
            <h2 className="mt-3 text-2xl font-bold text-navy">Same Day Purchase Surprise Gift</h2>
            <p className="mt-2 text-ink/80">
              Buy your policy on the same day you receive your quote and get a surprise gift
              from us — our way of saying thank you for trusting CreditGuru Insurance.
            </p>
            <Link href="/quote" className="mt-4 inline-block font-semibold text-teal hover:underline">
              Get your quote today →
            </Link>
          </div>
          <div className="rounded-2xl bg-mist p-8 ring-1 ring-teal/30">
            <p className="text-3xl" aria-hidden="true">🤝</p>
            <h2 className="mt-3 text-2xl font-bold text-navy">Refer Friends and Earn Rewards</h2>
            <p className="mt-2 text-ink/80">
              Share your referral code with friends and family. When they buy a policy through
              your referral, you earn rewards — from a surprise gift up to VIP status.
            </p>
            <Link href="/quote?ref=HARI1001" className="mt-4 inline-block font-semibold text-teal hover:underline">
              Learn about referral rewards →
            </Link>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section id="products" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy">Insurance Products</h2>
          <p className="mt-2 max-w-2xl text-ink/70">
            Six kinds of cover, one advisor who explains them in simple language and helps you
            compare before you decide.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-teal"
              >
                <p className="text-3xl" aria-hidden="true">{p.icon}</p>
                <h3 className="mt-3 text-xl font-bold text-navy group-hover:text-teal">{p.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{p.desc}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-teal">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BUY TODAY campaign */}
      <section className="bg-amber py-14 text-navy">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-wide sm:text-4xl">BUY TODAY. GET REWARDED.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy/80">
            Customers who purchase their policy within 24 hours of receiving a quote get a
            surprise gift. No waiting, no confusion — decide with confidence and get rewarded
            for it.
          </p>
          <Link
            href="/quote"
            className="mt-6 inline-block rounded-full bg-navy px-8 py-3 font-semibold text-white transition hover:bg-deepnavy"
          >
            Get My Quote Now
          </Link>
        </div>
      </section>

      {/* Social proof band */}
      <section className="bg-navy py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-4xl font-extrabold text-amber sm:text-5xl">{SOCIAL_PROOF.policiesSold}</p>
            <p className="mt-2 font-medium text-white/80">{SOCIAL_PROOF.policiesSoldLabel}</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-amber sm:text-5xl">{SOCIAL_PROOF.familiesGuided}</p>
            <p className="mt-2 font-medium text-white/80">{SOCIAL_PROOF.familiesGuidedLabel}</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-amber sm:text-5xl">{EXPERIENCE_YEARS} Years</p>
            <p className="mt-2 font-medium text-white/80">Experience</p>
          </div>
        </div>
      </section>

      {/* Referral tiers preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-navy">Referral Rewards</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink/70">
          The more friends you help protect, the bigger your reward.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REFERRAL_REWARD_TIERS.map((tier) => (
            <div key={tier.policies} className="rounded-2xl bg-mist p-6 text-center">
              <p className="text-3xl font-extrabold text-teal">{tier.policies}</p>
              <p className="text-sm text-ink/70">
                {tier.policies === 1 ? "policy" : "policies"} referred
              </p>
              <p className="mt-2 font-bold text-navy">{tier.reward}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — empty state only, no invented testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy">What Our Customers Say</h2>
          <p className="mt-4 text-lg text-ink/70">
            Our customers&apos; stories coming soon — share yours with us.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-full bg-teal px-6 py-3 font-semibold text-white transition hover:bg-deepteal"
          >
            Share Your Experience
          </Link>
        </div>
      </section>

      {/* WhatsApp / contact */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-navy p-8 text-center text-white sm:p-12">
          <h2 className="text-3xl font-bold">Not sure which policy fits you?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Talk to us first — we will understand your needs, compare the options, and guide
            you to the policy that suits you. No pressure, no jargon.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={whatsappLink("Hi, I need help choosing an insurance plan.")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:brightness-95"
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
        </div>
      </section>
    </div>
  );
}
