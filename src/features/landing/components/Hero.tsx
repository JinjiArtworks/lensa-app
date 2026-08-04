import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroMockup } from "./HeroMockup";

export function Hero() {
  return (
    <section className="overflow-hidden bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 px-5 md:grid-cols-2 md:gap-14">
        <div>
          <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-accent-text before:h-px before:w-3.5 before:bg-accent">
            Buat pemilik bisnis yang jualan di lebih dari satu platform
          </span>
          <h1 className="mt-4 font-display text-[34px] font-bold leading-[1.06] tracking-tight md:text-[52px]">
            Semua performa iklanmu, dalam satu tampilan yang <span className="text-accent-deep">jernih</span>.
          </h1>
          <p className="mt-5 max-w-[460px] text-[16.5px] leading-relaxed text-ink-2">
            Lensa menyatukan Meta Ads dan TikTok Ads dalam satu dashboard, lengkap dengan AI Insight yang menerjemahkan
            datanya jadi langkah bisnis yang jelas — bukan istilah teknis yang bikin pusing.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-in">Mulai Gratis</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <a href="#cara-kerja">Lihat Cara Kerjanya</a>
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3.5 text-xs font-semibold text-ink-3">
            <span>Gratis untuk 1 bisnis</span>
            <span>Tanpa kartu kredit</span>
            <span>Aktif dalam 5 menit</span>
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}
