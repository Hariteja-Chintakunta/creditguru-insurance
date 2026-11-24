import type { Metadata } from "next";
import ProductPageLayout from "@/components/ProductPageLayout";

export const metadata: Metadata = {
  title: "Motor Insurance in Hyderabad — CreditGuru Insurance",
  description:
    "Car, bike and commercial vehicle insurance in Hyderabad. Third-party and comprehensive cover, quick renewals, from CreditGuru Insurance.",
};

export default function MotorPage() {
  return (
    <ProductPageLayout
      title="Motor Insurance"
      intro="Motor insurance protects you from the cost of accidents, theft and damage to your vehicle — and third-party cover is legally required to drive on Indian roads. Whether it is your car, your bike, or a commercial vehicle, the right policy keeps you covered and compliant."
      plans={[
        {
          name: "Car Insurance",
          desc: "Comprehensive cover for your car — own damage from accidents, fire and natural calamities, theft, plus third-party liability. Add-ons such as zero depreciation and roadside assistance are available.",
        },
        {
          name: "Bike Insurance",
          desc: "Cover for your two-wheeler — own damage and third-party liability, with add-ons such as zero depreciation, engine protection and personal accident cover for the rider.",
        },
        {
          name: "Commercial Vehicle Insurance",
          desc: "Cover for goods-carrying and passenger-carrying commercial vehicles — third-party liability and own damage, with options suited to business use and fleet needs.",
        },
      ]}
      benefits={[
        "Own damage cover: repairs for your vehicle after an accident, fire, flood, storm or theft, as per the policy terms.",
        "Third-party liability cover: pays for injury or damage you cause to others — legally mandatory in India.",
        "Personal accident cover for the owner-driver, as required by law and available as an add-on for others.",
        "No-claim bonus: your premium reduces for every claim-free year — up to 50% over five years in many plans.",
        "Cashless repairs at network garages of the insurer.",
        "Useful add-ons: zero depreciation, engine protection, roadside assistance, and return-to-invoice cover.",
      ]}
      whyBuy={[
        "We compare premiums and add-ons across insurers, so you do not overpay for cover you do not need — or miss cover you do.",
        "We explain the difference between third-party and comprehensive cover in plain words.",
        "We help you choose the right add-ons for your vehicle — a new car benefits from zero depreciation, an older bike may not need it.",
        "We guide you through claims — what to do after an accident, which documents are needed, and how the garage process works.",
        "Renewal reminders before your policy expires, so you are never driving uninsured.",
      ]}
      faqs={[
        {
          q: "Is third-party motor insurance mandatory in India?",
          a: "Yes. Under the Motor Vehicles Act, every vehicle on the road must have at least third-party liability insurance. Driving without it can lead to fines and legal trouble. Comprehensive cover is optional but strongly recommended.",
        },
        {
          q: "What is zero depreciation add-on?",
          a: "In a standard policy, the insurer deducts depreciation on replaced parts (such as plastic and metal parts) when settling a claim. With zero depreciation cover, the full cost of parts is paid, so you pay much less out of pocket at the garage. It is most useful for newer vehicles.",
        },
        {
          q: "What is a no-claim bonus (NCB)?",
          a: "NCB is a discount on your own-damage premium for every claim-free year — typically 20% after one year, rising to 50% after five claim-free years. It belongs to you, not the vehicle, so you can transfer it when you buy a new vehicle.",
        },
        {
          q: "What should I do after an accident?",
          a: "First, make sure everyone is safe and call for medical help if needed. Then inform the police if there is injury or major damage, note the other vehicle's details, take photos, and inform the insurer as soon as possible. Do not move the vehicle or start repairs before the insurer's survey, unless it is unsafe to leave it. We guide you step by step when you call us.",
        },
      ]}
    />
  );
}
