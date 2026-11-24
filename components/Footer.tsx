import Link from "next/link";
import { EMAIL, PHONE, PHONE_TEL, SERVICE_AREA, SITE_NAME, whatsappLink } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/portal", label: "Customer Portal" },
];

const PRODUCT_LINKS = [
  { href: "/products/health", label: "Health Insurance" },
  { href: "/products/life", label: "Life Insurance" },
  { href: "/products/term", label: "Term Insurance" },
  { href: "/products/savings", label: "Savings Plans" },
  { href: "/products/motor", label: "Motor Insurance" },
  { href: "/products/commercial", label: "Commercial Insurance" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-xl font-bold">
            <span className="text-teal-300">CreditGuru</span> Insurance
          </p>
          <p className="mt-3 text-sm text-white/70">Securing Life with Good Guidance</p>
          <p className="mt-4 text-sm text-white/70">
            Health, Life, Term, Savings and Vehicle insurance guidance for families and
            businesses in Hyderabad, Telangana — with more than 7 years of experience.
          </p>
        </div>

        <nav aria-label="Quick links">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-300">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/80 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Insurance products">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-300">Products</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/80 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-300">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              Phone:{" "}
              <a href={PHONE_TEL} className="hover:text-white">
                {PHONE}
              </a>
            </li>
            <li>
              Email:{" "}
              <a href={`mailto:${EMAIL}`} className="hover:text-white">
                {EMAIL}
              </a>
            </li>
            <li>Service area: {SERVICE_AREA}</li>
            <li>
              <a
                href={whatsappLink("Hi, I need help with insurance.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-teal px-4 py-2 font-semibold text-white transition hover:bg-deepteal"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/60 sm:px-6 lg:px-8">
          © 2026 {SITE_NAME}. All rights reserved. | {SERVICE_AREA}
        </p>
      </div>
    </footer>
  );
}
