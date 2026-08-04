import { Reveal } from "./Reveal";
import { TESTIMONIALS } from "../mock-data";

export function TestimonialsSection() {
  return (
    <section className="border-y border-line bg-card py-16 md:py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Dipakai Pemilik Bisnis Kayak Kamu
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Bukan cuma buat toko fashion — semua bisnis yang jualan lewat iklan.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              className={`flex flex-col gap-4 rounded-2xl border border-line bg-bg p-6 ${i === 1 ? "md:translate-y-[18px]" : ""}`}
            >
              <div aria-label="5 dari 5 bintang" className="text-[13px] tracking-[2px] text-accent">
                ★★★★★
              </div>
              <p className="text-sm leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
              <div className="inline-flex w-fit rounded-full bg-accent-bg px-3 py-1 text-[11.5px] font-extrabold text-accent-text">
                {t.stat}
              </div>
              <div className="mt-auto flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-[13px] font-extrabold text-ink">
                  {t.avatarInitial}
                </div>
                <div>
                  <div className="text-[12.5px] font-bold">{t.name}</div>
                  <div className="text-[11px] text-ink-3">{t.business}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
