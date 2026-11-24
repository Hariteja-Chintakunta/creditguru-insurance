"use client";

import { useState } from "react";
import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "/products/health", label: "Health Insurance" },
  { href: "/products/life", label: "Life Insurance" },
  { href: "/products/term", label: "Term Insurance" },
  { href: "/products/savings", label: "Savings Plans" },
  { href: "/products/motor", label: "Motor Insurance" },
  { href: "/products/commercial", label: "Commercial Insurance" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight sm:text-2xl" onClick={closeMobile}>
          <span className="text-teal-300">CreditGuru</span> Insurance
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex" aria-label="Main navigation">
          <Link href="/" className="hover:text-teal-300">Home</Link>
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-teal-300"
              aria-expanded={productsOpen}
              aria-haspopup="true"
              onClick={() => setProductsOpen((v) => !v)}
            >
              Products
              <span aria-hidden="true" className="text-xs">▾</span>
            </button>
            {productsOpen && (
              <div className="absolute left-0 top-full w-56 rounded-lg bg-white py-2 text-ink shadow-xl">
                {PRODUCT_LINKS.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="block px-4 py-2 hover:bg-mist hover:text-teal"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/about" className="hover:text-teal-300">About</Link>
          <Link href="/contact" className="hover:text-teal-300">Contact</Link>
          <Link href="/portal" className="hover:text-teal-300">Customer Portal</Link>
          <Link href="/admin" className="hover:text-teal-300">Admin</Link>
          <Link
            href="/quote"
            className="rounded-full bg-amber px-5 py-2 font-semibold text-navy transition hover:bg-amber-400"
          >
            Get a Quote
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="rounded-md p-2 hover:bg-white/10 lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="block text-2xl leading-none" aria-hidden="true">
            {mobileOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-white/10 px-4 pb-4 pt-2 lg:hidden" aria-label="Mobile navigation">
          <Link href="/" className="block py-2 font-medium hover:text-teal-300" onClick={closeMobile}>Home</Link>
          <button
            type="button"
            className="flex w-full items-center justify-between py-2 font-medium hover:text-teal-300"
            aria-expanded={mobileProductsOpen}
            onClick={() => setMobileProductsOpen((v) => !v)}
          >
            Products
            <span aria-hidden="true" className="text-xs">{mobileProductsOpen ? "▴" : "▾"}</span>
          </button>
          {mobileProductsOpen && (
            <div className="pl-4">
              {PRODUCT_LINKS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block py-2 text-sm text-white/80 hover:text-teal-300"
                  onClick={closeMobile}
                >
                  {p.label}
                </Link>
              ))}
            </div>
          )}
          <Link href="/about" className="block py-2 font-medium hover:text-teal-300" onClick={closeMobile}>About</Link>
          <Link href="/contact" className="block py-2 font-medium hover:text-teal-300" onClick={closeMobile}>Contact</Link>
          <Link href="/portal" className="block py-2 font-medium hover:text-teal-300" onClick={closeMobile}>Customer Portal</Link>
          <Link href="/admin" className="block py-2 font-medium hover:text-teal-300" onClick={closeMobile}>Admin</Link>
          <Link
            href="/quote"
            className="mt-3 block rounded-full bg-amber px-5 py-2 text-center font-semibold text-navy"
            onClick={closeMobile}
          >
            Get a Quote
          </Link>
        </nav>
      )}
    </header>
  );
}
