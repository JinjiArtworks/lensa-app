"use client";

import { useState } from "react";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Nav } from "@/features/landing/components/Nav";
import { Hero } from "@/features/landing/components/Hero";
import { ProblemSection } from "@/features/landing/components/ProblemSection";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { FeaturesGrid } from "@/features/landing/components/FeaturesGrid";
import { AiInsightSpotlight } from "@/features/landing/components/AiInsightSpotlight";
import { TrendChartSection } from "@/features/landing/components/TrendChartSection";
import { PricingSection } from "@/features/landing/components/PricingSection";
import { CheckoutModal } from "@/features/landing/components/CheckoutModal";
import { Reveal } from "@/features/landing/components/Reveal";
import { BrandMark } from "@/features/landing/components/BrandMark";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
});

export default function LandingPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className={`${bricolage.variable} landing-grid-bg`}>
      <Nav />

      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeaturesGrid />
        <AiInsightSpotlight />
        <TrendChartSection />
        <PricingSection onOpenCheckout={() => setCheckoutOpen(true)} />

        <section className="px-5 py-16 text-center md:py-[92px]">
          <Reveal className="mx-auto max-w-[640px]">
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
              Saatnya Coba Sendiri
            </span>
            <h2 className="mt-3.5 font-display text-2xl font-bold tracking-tight md:text-[32px]">
              Lihat performa iklanmu lebih jernih, mulai hari ini.
            </h2>
            <p className="mx-auto mt-2.5 max-w-[420px] text-sm text-ink-3">
              Coba Lensa gratis untuk 1 bisnis — nggak perlu kartu kredit, dan kamu bisa mulai dalam 5 menit.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/sign-in">Mulai Gratis</Link>
            </Button>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line bg-white px-5 py-[60px]">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark size={26} />
              <span className="font-display font-semibold text-ink-2">Lensa</span>
            </div>
            <p className="mt-3 max-w-[240px] text-[13px] leading-relaxed text-ink-2">
              Satu dashboard untuk semua performa iklanmu — Meta Ads dan TikTok Ads, jernih dalam satu tampilan,
              lengkap dengan AI yang membantu menentukan langkah berikutnya.
            </p>
          </div>
          <div>
            <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Produk</div>
            {[
              { href: "#cara-kerja", label: "Cara Kerja" },
              { href: "#fitur", label: "Fitur" },
              { href: "#harga", label: "Harga" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Perusahaan</div>
            <a href="#top" className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              Tentang Lensa
            </a>
            <a href="#top" className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              Kontak
            </a>
          </div>
          <div>
            <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Legal</div>
            <a href="#top" className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              Ketentuan Layanan
            </a>
            <a href="#top" className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </footer>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
