import type { Metadata } from "next";
import ProductPageLayout from "@/components/ProductPageLayout";

export const metadata: Metadata = {
  title: "Life Insurance in Hyderabad — CreditGuru Insurance",
  description:
    "Whole life and child life insurance plans in Hyderabad. Protect your family's future and plan for your children's goals with CreditGuru Insurance.",
};

export default function LifePage() {
  return (
    <ProductPageLayout
      title="Life Insurance"
      intro="Life insurance is a promise to your family: if something happens to you, they will still have the money they need — to run the household, pay off loans, and fund your children's education. Some plans also build savings for the future."
      plans={[
        {
          name: "Whole Life Insurance",
          desc: "Life-long protection, typically up to age 99 or 100, with a payout to your family whenever the insured person passes away. Some whole life plans also build a cash value over time.",
        },
        {
          name: "Child Plans",
          desc: "Plans that secure your child's future — money is paid out at key milestones such as higher education, even if the parent is no longer around, with premiums often waived after the parent's death.",
        },
        {
          name: "Wealth Protection Plans",
          desc: "Plans that combine life cover with savings — a lump sum at maturity for your goals, plus protection for your family throughout the policy term.",
        },
      ]}
      benefits={[
        "Financial security for your family — a lump sum that replaces lost income and helps them stay in their home and lifestyle.",
        "Helps repay outstanding loans such as a home loan, so the burden does not fall on your family.",
        "Child plans protect your children's education and milestones even in your absence.",
        "Maturity benefits in savings-linked plans give you a lump sum for retirement or other goals.",
        "Tax benefits on premiums and maturity proceeds, subject to prevailing tax rules.",
        "Peace of mind — knowing your family's future is protected, whatever happens.",
      ]}
      whyBuy={[
        "We help you calculate the right cover — based on your income, loans, children's education and family expenses — instead of guessing.",
        "We compare plans across insurers on cover, premiums, maturity benefits and claim settlement record.",
        "We explain the difference between term, whole life and savings plans in simple language, so you choose what fits your goal.",
        "We assist your family with the claim process when it matters most.",
        "Renewal reminders so your policy never lapses and your family's protection stays active.",
      ]}
      faqs={[
        {
          q: "How much life insurance cover do I need?",
          a: "A common rule of thumb is 10 to 15 times your annual income, plus outstanding loans and future goals such as children's education. The right amount depends on your income, liabilities and family needs — we help you work it out before recommending a plan.",
        },
        {
          q: "What is the difference between term insurance and life insurance?",
          a: "Term insurance is pure protection — high cover at a low premium, with no maturity benefit if you survive the term. Life insurance plans such as whole life or savings plans combine protection with maturity or savings benefits, and cost more for the same cover. We explain both so you can choose based on your goal.",
        },
        {
          q: "At what age should I buy life insurance?",
          a: "The earlier, the better — premiums are lowest when you are young and healthy. Buying early also locks in cover before any health issues arise. That said, it is never too late: plans are available at most ages, with premiums based on age and health.",
        },
        {
          q: "What documents are needed to buy life insurance?",
          a: "Typically an identity proof (such as Aadhaar or PAN), address proof, income proof in some cases, and a medical test for higher covers or older ages. We guide you through exactly what is needed for the plan you choose.",
        },
      ]}
    />
  );
}
