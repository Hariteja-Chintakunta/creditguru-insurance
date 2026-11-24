import type { Metadata } from "next";
import ProductPageLayout from "@/components/ProductPageLayout";

export const metadata: Metadata = {
  title: "Savings Plans in Hyderabad — CreditGuru Insurance",
  description:
    "ULIP, endowment, pension and retirement savings plans in Hyderabad. Grow your money with life protection from CreditGuru Insurance.",
};

export default function SavingsPage() {
  return (
    <ProductPageLayout
      title="Savings Plans"
      intro="Savings plans help you build a fund for your future goals — your child's education, a house, or a comfortable retirement — while keeping life protection for your family. You pay premiums regularly, and your money grows over time."
      plans={[
        {
          name: "ULIP (Unit Linked Insurance Plan)",
          desc: "A plan that combines life cover with market-linked investment. Your premiums are invested in funds you choose (equity, debt or balanced), with the flexibility to switch funds as your goals change.",
        },
        {
          name: "Endowment Plan",
          desc: "A traditional savings plan: you get a lump sum at maturity if you survive the term, and your family gets the sum assured if something happens to you during the term. Steady and predictable.",
        },
        {
          name: "Pension Plan",
          desc: "A plan that builds a retirement corpus during your working years, which then provides a regular pension income after retirement — so your monthly income continues even after you stop working.",
        },
        {
          name: "Retirement Plan",
          desc: "A long-term plan designed to create a retirement fund, with options for a lump sum, regular pension, or a mix of both — plus life cover during the accumulation years.",
        },
      ]}
      benefits={[
        "Disciplined savings — regular premiums build a fund for education, marriage, a house or retirement.",
        "Life cover throughout the policy term, so your family's goals stay protected even if you are not around.",
        "Maturity benefit: a lump sum or regular income at the end of the term, as per the plan.",
        "Flexibility in ULIPs to choose and switch investment funds based on your risk appetite.",
        "Tax benefits on premiums and maturity proceeds, subject to prevailing tax rules.",
        "A clear, goal-based way to save — you know what you are saving for and when the money will come.",
      ]}
      whyBuy={[
        "We match the plan to your goal and time horizon — a child's education in 10 years needs a different plan from retirement in 25 years.",
        "We explain charges, fund options and expected returns honestly, including the difference between guaranteed and market-linked plans.",
        "We compare plans across insurers on maturity value, flexibility and claim settlement.",
        "We remind you about premiums and renewals, so your plan stays on track.",
        "We review your plan with you as your goals change, and help you adjust if needed.",
      ]}
      faqs={[
        {
          q: "What is the difference between a ULIP and an endowment plan?",
          a: "A ULIP invests your money in market-linked funds, so returns vary with the market and can be higher over the long term — but are not guaranteed. An endowment plan offers more predictable, guaranteed-type returns, usually lower than a good ULIP over the long term. We help you choose based on your comfort with market risk.",
        },
        {
          q: "When should I start a retirement plan?",
          a: "As early as possible. Starting in your 20s or 30s means smaller premiums can build a large corpus, because your money gets more years to grow. Starting late means higher premiums for the same retirement income.",
        },
        {
          q: "Can I withdraw money from a savings plan before maturity?",
          a: "It depends on the plan. ULIPs usually allow partial withdrawals after the 5-year lock-in period. Endowment and pension plans have their own surrender and loan rules. We will explain the exact rules of the plan you choose before you buy.",
        },
        {
          q: "Are savings plans safe?",
          a: "Traditional plans from established insurers offer guaranteed-type benefits as per the policy terms. ULIPs carry market risk because they invest in funds — but you choose the fund type, and debt funds are steadier than equity funds. We explain the risk of each option clearly.",
        },
      ]}
    />
  );
}
