import type { Metadata } from "next";
import ProductPageLayout from "@/components/ProductPageLayout";

export const metadata: Metadata = {
  title: "Commercial Insurance in Hyderabad — CreditGuru Insurance",
  description:
    "Employee health and group insurance for businesses in Hyderabad. Protect your team and your business with CreditGuru Insurance.",
};

export default function CommercialPage() {
  return (
    <ProductPageLayout
      title="Commercial Insurance"
      intro="Your employees are your business's greatest strength — and group insurance shows them you care. Commercial insurance covers your team's health and protects your business, while helping you attract and retain good people."
      plans={[
        {
          name: "Employee Health Insurance",
          desc: "Group health cover for your employees and, optionally, their families — hospitalisation cover, cashless treatment at network hospitals, and optional maternity and pre-existing disease cover from day one in many group plans.",
        },
        {
          name: "Group Insurance",
          desc: "Group life and group personal accident cover for your workforce — a lump sum to an employee's family in case of death or disability, at a low cost per employee because the risk is shared across the group.",
        },
      ]}
      benefits={[
        "Health security for your employees — hospitalisation cover that protects them from unexpected medical bills.",
        "Higher employee satisfaction and retention — group health cover is one of the most valued benefits by employees.",
        "Group plans often cover pre-existing diseases from day one and include maternity benefits, which individual plans usually do not.",
        "Low cost per employee — group pricing is typically much cheaper than individual policies for the same cover.",
        "Simple administration — one policy for the whole team, with additions and deletions as employees join or leave.",
        "Tax benefits for the business on premiums paid, subject to prevailing tax rules.",
      ]}
      whyBuy={[
        "We design the cover around your team size, budget and workforce profile — from a small startup to a large team.",
        "We compare group plans across insurers on hospital networks in Hyderabad, waiting periods and claim settlement.",
        "We handle the paperwork — employee lists, additions, deletions and renewals — so you do not have to.",
        "We support your employees during claims, guiding them through cashless hospitalisation and documents.",
        "Renewal reminders and annual reviews, so your cover keeps pace as your team grows.",
      ]}
      faqs={[
        {
          q: "How many employees do I need for a group insurance policy?",
          a: "Most insurers offer group health insurance for teams of as few as 7 to 10 employees, though the minimum varies by insurer. Even small businesses can usually get group cover — talk to us and we will check the options for your team size.",
        },
        {
          q: "Does group health insurance cover employees' families?",
          a: "Yes, in many plans you can extend cover to spouses, children and dependent parents, for an additional premium. We will show you the options and costs for your team.",
        },
        {
          q: "Are pre-existing diseases covered in group health insurance?",
          a: "In many group plans, pre-existing diseases are covered from day one — a major advantage over individual plans, which have waiting periods. The exact terms depend on the insurer and the plan, and we will confirm them before you buy.",
        },
        {
          q: "What happens when an employee leaves the company?",
          a: "The employee is removed from the group policy, and the cover ends for them. Many employees can then convert to an individual policy or buy their own cover — and we can help them with that, so they are never left unprotected.",
        },
      ]}
    />
  );
}
