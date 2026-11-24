import Link from "next/link";
import type { Metadata } from "next";
import { REFERRAL_REWARD_TIERS, SITE_NAME, whatsappLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "You Are Invited — CreditGuru Insurance Referral",
  description:
    "A friend invited you to CreditGuru Insurance, Hyderabad. Get a free insurance quote and earn referral rewards.",
};

interface RefPageProps {
  params: { code: string };
}

export default function ReferralPage({ params }: RefPageProps) {
  const code = params.code;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-mist p-8 text-center sm:p-12">
        <p className="text-4xl" aria-hidden="true">🎉</p>
        <h1 className="mt-4 text-3xl font-bold text-navy sm:text-4xl">
          You&apos;ve Been Invited to {SITE_NAME}!
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink/80">
          A friend invited you to CreditGuru Insurance — your trusted insurance advisor in
          Hyderabad. Get a free quote for health, life, term, savings or vehicle insurance,
          and let us guide you to the policy that suits you.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-xl bg-white p-5 ring-1 ring-teal/30">
          <p className="text-sm font-medium uppercase tracking-wider text-ink/60">
            Your referral code
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-widest text-teal">{code}</p>
          <p className="mt-2 text-xs text-ink/60">
            Share this code when you request your quote — it links your policy to your friend&apos;s referral.
          </p>
        </div>
        <Link
          href={`/quote?ref=${encodeURIComponent(code)}`}
          className="mt-8 inline-block rounded-full bg-amber px-8 py-3 font-semibold text-navy transition hover:bg-amber-400"
        >
          Get My Free Quote
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-center text-2xl font-bold text-navy">How Referral Rewards Work</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink/70">
          When you buy a policy through a referral, your friend earns a reward — and once you
          have your own referral code, you can earn rewards too by inviting your friends.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REFERRAL_REWARD_TIERS.map((tier) => (
            <div key={tier.policies} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-200">
              <p className="text-3xl font-extrabold text-teal">{tier.policies}</p>
              <p className="text-sm text-ink/70">
                {tier.policies === 1 ? "policy" : "policies"} referred
              </p>
              <p className="mt-2 font-bold text-navy">{tier.reward}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink/60">
          1 policy — Surprise Gift · 3 policies — Premium Gift · 5 policies — Gold Member · 10 policies — VIP
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-navy p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Questions? Talk to us first.</h2>
        <p className="mt-2 text-white/80">
          Not sure which policy you need? Message us on WhatsApp and we will help you choose.
        </p>
        <a
          href={whatsappLink(`Hi, I was referred with code ${code} and I need help with insurance.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:brightness-95"
        >
          Chat on WhatsApp
        </a>
      </section>
    </div>
  );
}
