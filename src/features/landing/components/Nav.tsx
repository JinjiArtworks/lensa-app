"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./BrandMark";

// Order matches the section order on the page, so clicking through the nav
// always scrolls forward — never jumps back up to an earlier section.
// href is absolute ("/#id") so these always resolve to the homepage section,
// even when clicked from another route like /ketentuan-layanan.
const NAV_LINKS = [
  { id: "cara-kerja", href: "/#cara-kerja", label: "Cara Kerja" },
  { id: "fitur", href: "/#fitur", label: "Fitur" },
  { id: "harga", href: "/#harga", label: "Harga" },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="font-display text-[15px] font-extrabold tracking-tight">Lensa</span>
        </div>

        <nav className="hidden items-center gap-6 text-[13px] font-semibold text-ink-2 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={`relative pb-0.5 transition-colors ${isActive ? "text-ink" : "hover:text-ink"}`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-accent transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-in">Coba Gratis</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex size-9 items-center justify-center rounded-lg border border-line md:hidden"
          aria-label="Buka menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-line bg-card px-5 py-3 shadow-lg md:hidden">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? "true" : undefined}
                className={`rounded-lg px-2 py-2 text-[13px] font-semibold ${
                  isActive ? "text-accent-deep" : "text-ink-2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/sign-in" className="rounded-lg px-2 py-2 text-[13px] font-semibold text-ink-2">
            Masuk
          </Link>
          <Button className="mt-1 w-full justify-center" asChild>
            <Link href="/sign-in">Coba Gratis</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
