import type { Metadata } from "next";
import ProductPageLayout from "@/components/ProductPageLayout";

export const metadata: Metadata = {
  title: "Health Insurance in Hyderabad — CreditGuru Insurance",
  description:
    "Individual, family floater, senior citizen and critical illness health insurance in Hyderabad. Compare plans and get a free quote from CreditGuru Insurance.",
};

export default function HealthPage() {
  return (
    <ProductPageLayout
      title="Health Insurance"
      intro="A hospital bill can wipe out years of savings in a single week. Health insurance pays for hospitalisation, surgery and treatment, so a medical emergency never becomes a financial emergency for your family."
      plans={[
        {
          name: "Individual Health Insurance",
          desc: "Cover for one person — hospitalisation, day-care procedures, pre- and post-hospitalisation expenses, and ambulance charges, as per the policy terms.",
        },
        {
          name: "Family Floater",
          desc: "One sum insured shared by the whole family — husband, wife and children under a single policy, usually more affordable than separate individual covers.",
        },
        {
          name: "Senior Citizen Health Insurance",
          desc: "Cover designed for parents and elders, with entry ages typically from 60 years and features suited to age-related health needs.",
        },
        {
          name: "Critical Illness Cover",
          desc: "A lump-sum payout on diagnosis of a listed serious illness such as cancer, heart attack or stroke — money you can use for treatment, recovery or household expenses.",
        },
      ]}
      benefits={[
        "Cashless hospitalisation at network hospitals — the insurer settles the bill directly with the hospital.",
        "Cover for room rent, ICU charges, doctor fees, surgery, medicines and diagnostic tests during hospitalisation.",
        "Pre- and post-hospitalisation expenses, such as consultations and tests before admission and medicines after discharge.",
        "No-claim bonus: your sum insured can increase for every claim-free year, at no extra premium in many plans.",
        "Tax benefit on premiums paid, under Section 80D of the Income Tax Act, subject to prevailing rules.",
        "Free annual health check-ups in many plans, to catch health issues early.",
      ]}
      whyBuy={[
        "We compare plans across insurers on waiting periods, room-rent limits, co-payment and claim settlement — not just on premium.",
        "We explain exclusions and waiting periods in plain words before you buy, so there are no surprises at claim time.",
        "We help you choose the right sum insured for your family size, age and the cost of hospitals in Hyderabad.",
        "We support you during claims — guiding you on documents and following up until settlement.",
        "Renewal reminders before your policy expires, so your cover never lapses.",
      ]}
      faqs={[
        {
          q: "What is the waiting period in health insurance?",
          a: "Most policies have a waiting period of 30 days for general illnesses (except accidents, which are usually covered from day one), 2 years for specific listed illnesses, and 3–4 years for pre-existing diseases. The exact periods differ by insurer and plan, and we will show them to you before you buy.",
        },
        {
          q: "Does health insurance cover pre-existing diseases?",
          a: "Yes, but only after the waiting period for pre-existing diseases is completed — usually 3 to 4 years. It is important to declare all existing conditions honestly when buying, because non-disclosure can lead to claim rejection.",
        },
        {
          q: "What is a family floater plan?",
          a: "A family floater is one policy with a single sum insured shared by all covered family members. If one member uses part of the cover, the balance remains available for others. It is usually cheaper than buying separate policies for each member.",
        },
        {
          q: "What is cashless hospitalisation?",
          a: "At a network hospital, you show your health card and the insurer pays the hospital directly for covered expenses, as per the policy terms. You only pay for items that are not covered. We help you find plans with a strong hospital network in Hyderabad.",
        },
      ]}
    />
  );
}
