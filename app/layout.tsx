import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditGuru Insurance — Health, Life, Term, Savings & Vehicle Insurance in Hyderabad",
  description:
    "CreditGuru Insurance, Hyderabad. Health Insurance Hyderabad, Term Insurance Advisor, Life Insurance Advisor, Vehicle Insurance Hyderabad. Compare plans, get free quotes, track policies and renewals — 7+ years of trusted guidance. 1000+ policies sold, 10,000+ families guided.",
  keywords: [
    "Health Insurance Hyderabad",
    "Term Insurance Advisor",
    "Life Insurance Advisor",
    "Vehicle Insurance Hyderabad",
    "Best Insurance Consultant",
    "Insurance Comparison Services",
    "Family Health Insurance",
    "Commercial Insurance Services",
    "CreditGuru Insurance",
  ],
  openGraph: {
    title: "CreditGuru Insurance — Securing Life with Good Guidance",
    description:
      "Health, Life, Savings & Vehicle Insurance in One Place. 7+ years of experience, 1000+ policies sold, 10,000+ families guided in Hyderabad.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
