import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { FEATURES } from "../mock-data";

export function FeaturesGrid() {
  return (
    <section id="fitur" className="scroll-mt-20 border-b border-line bg-card py-16 md:py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">Fitur Utama</span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Lihat angkanya, langsung tau harus ngapain.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Nggak perlu ngerti istilah marketing buat pake Lensa. Semua fitur dibuat biar kamu bisa langsung ambil
            keputusan.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Reveal
              key={f.title}
              className="rounded-2xl border border-line bg-bg p-6 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
            >
              <div className="mb-4 inline-flex size-[42px] items-center justify-center rounded-xl bg-accent-bg text-accent-text">
                <f.icon className="size-5" />
              </div>
              <div className="text-[15.5px] font-bold">{f.title}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{f.desc}</p>
              <div className="mt-3.5 flex w-full items-center gap-1.5 border-t border-line-2 pt-3 text-[11px] font-bold text-ink-3">
                <Check className="size-3 text-accent-deep" />
                {f.proof}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
