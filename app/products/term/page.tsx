import type { Metadata } from "next";
import ProductPageLayout from "@/components/ProductPageLayout";

export const metadata: Metadata = {
  title: "Term Insurance in Hyderabad — CreditGuru Insurance",
  description:
    "Pure protection term insurance in Hyderabad — high cover at an affordable premium, with income protection options. Get a free quote from CreditGuru Insurance.",
};

export default function TermPage() {
  return (
    <ProductPageLayout
      title="Term Insurance"
      intro="Term insurance is the simplest, most affordable way to protect your family: a large life cover for a small premium. If something happens to you during the term, your family receives the full sum assured. If you outlive the term, the cover ends — that is why the premium is so low."
      plans={[
        {
          name: "Pure Protection Term Plan",
          desc: "A fixed sum assured for a chosen term — for example, ₹1 crore cover for 20 or 30 years — at the lowest premium for the cover you get. Ideal for the main earning member of the family.",
        },
        {
          name: "Income Protection Term Plan",
          desc: "Instead of (or in addition to) a lump sum, your family receives a regular monthly income for a fixed number of years after your death — so household expenses keep getting paid, month after month.",
        },
      ]}
      benefits={[
        "Highest life cover per rupee of premium — a ₹1 crore cover can cost less than a daily cup of tea for a young, healthy person.",
        "Protects your family's lifestyle, children's education and loan repayments if you are not around.",
        "Optional riders such as accidental death benefit and critical illness cover, to strengthen the protection.",
        "Tax benefits on premiums paid, subject to prevailing tax rules.",
        "Simple to understand — no investment confusion, just pure protection.",
        "Flexible term and payout options: lump sum, monthly income, or a combination.",
      ]}
      whyBuy={[
        "We help you pick the right cover and term — enough to replace your income until your children are settled and loans are repaid.",
        "We compare premiums and claim settlement records across insurers, so you get reliable cover at a fair price.",
        "We explain riders honestly — which ones add real value for you, and which ones you do not need.",
        "We assist your family with the claim process, when support matters most.",
        "Renewal and premium reminders, so your protection never lapses.",
      ]}
      faqs={[
        {
          q: "What happens if I survive the term?",
          a: "In a pure term plan, the cover simply ends and no maturity amount is paid — that is why premiums are so low. Some plans offer a return-of-premium option, where the premiums paid are returned, but these cost more. We will show you both options so you can decide.",
        },
        {
          q: "How much term cover should I buy?",
          a: "A common guide is 10 to 15 times your annual income, plus any outstanding loans. For example, if you earn ₹10 lakhs a year and have a ₹30 lakh home loan, a cover of ₹1.3 crore or more is a sensible starting point. We help you calculate it for your situation.",
        },
        {
          q: "Do I need a medical test for term insurance?",
          a: "For most term plans, especially at higher covers or older ages, the insurer asks for a medical test. It is usually a simple test arranged at your home or a nearby centre, and it helps the insurer offer you the right premium.",
        },
        {
          q: "Can I increase my cover later?",
          a: "Many term plans allow you to increase the sum assured at life milestones such as marriage or the birth of a child, subject to the plan's terms. We will explain the options in the plan you choose.",
        },
      ]}
    />
  );
}
