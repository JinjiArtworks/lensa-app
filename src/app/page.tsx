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
import { Footer } from "@/features/landing/components/Footer";

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

      <Footer />

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
