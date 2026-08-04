import { ArrowDown, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { BrandMark } from "./BrandMark";

const CHAOS_CARDS = [
  { label: "Meta Ads Manager", sub: "Tab 1 dari 4", rotate: "md:-rotate-[7deg]", offset: "md:left-0 md:top-1" },
  { label: "TikTok Ads Manager", sub: "Tab 2 dari 4", rotate: "md:rotate-[5deg]", offset: "md:left-[130px] md:top-[30px]" },
  { label: "Spreadsheet Manual", sub: "Tab 3 dari 4", rotate: "md:rotate-[4deg]", offset: "md:left-[10px] md:top-[120px]" },
  { label: "Grup WhatsApp Tim", sub: "Tab 4 dari 4", rotate: "md:-rotate-[4deg]", offset: "md:left-[150px] md:top-[150px]" },
];

function ChaosCard({ label, sub, className }: { label: string; sub: string; className?: string }) {
  return (
    <div className={`rounded-[10px] border border-line bg-gray-bg p-3 opacity-80 grayscale ${className ?? ""}`}>
      <div className="mb-2 size-5 rounded-md bg-gray" />
      <div className="text-[11px] font-bold text-ink-2">{label}</div>
      <div className="mt-0.5 text-[9.5px] text-ink-3">{sub}</div>
    </div>
  );
}

function FocusCard({ className }: { className?: string }) {
  return (
    <div className={className}>
      <BrandMark size={26} className="mb-2.5" />
      <div className="text-[12.5px] font-bold">Dashboard Lensa</div>
      <div className="mt-1 text-[11px] leading-snug text-ink-2">Satu tampilan. Satu jawaban jelas.</div>
    </div>
  );
}

export function ProblemSection() {
  return (
    <section className="border-y border-line bg-card py-16 md:py-[92px]">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 px-5 md:grid-cols-2">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-accent-text before:h-px before:w-3.5 before:bg-accent">
            Masalah yang sering dialami pemilik bisnis
          </span>
          <h2 className="mt-3.5 font-display text-[26px] font-bold leading-tight tracking-tight sm:text-[28px] md:text-[36px]">
            Empat tab kebuka bersamaan, tapi satu pertanyaan sederhana ini masih belum terjawab: iklan kita untung atau
            nggak?
          </h2>
          <p className="mt-3.5 text-[15px] leading-relaxed text-ink-2 sm:text-[15.5px]">
            Meta Ads Manager buat cek spend. TikTok Ads Manager buat cek closing. Spreadsheet buat rekap manual. Grup
            WhatsApp buat mastiin datanya masih akurat. Bukan karena kamu nggak niat ngurus — cuma belum ada satu
            tempat buat lihat semuanya sekaligus.
          </p>
        </Reveal>

        <Reveal>
          {/* Mobile/tablet: plain stacked flow — every card, the arrow, and the
              payoff focus card all stay visible and in normal reading order.
              The scattered/rotated art below is a desktop-only flourish. */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {CHAOS_CARDS.map((card) => (
                <ChaosCard key={card.label} label={card.label} sub={card.sub} />
              ))}
            </div>
            <div className="my-4 flex justify-center text-accent-deep">
              <ArrowDown className="size-5" aria-hidden="true" />
            </div>
            <FocusCard className="rounded-2xl border-[1.5px] border-accent bg-card p-4 shadow-sm" />
          </div>

          <div className="relative hidden h-[300px] md:block">
            {CHAOS_CARDS.map((card) => (
              <ChaosCard
                key={card.label}
                label={card.label}
                sub={card.sub}
                className={`absolute w-[168px] ${card.rotate} ${card.offset}`}
              />
            ))}
            <div className="absolute left-[300px] top-[130px] text-accent-deep/50" aria-hidden="true">
              <ArrowRight className="size-5" />
            </div>
            <FocusCard
              className="absolute left-[330px] top-10 w-[190px] rounded-2xl border-[1.5px] border-accent bg-card p-4 shadow-[0_30px_70px_-30px_rgba(22,22,26,.32),0_10px_30px_-14px_rgba(240,180,0,.22)]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
