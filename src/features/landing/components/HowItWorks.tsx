import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { HOW_IT_WORKS_STEPS } from "../mock-data";

export function HowItWorks() {
  const lastIndex = HOW_IT_WORKS_STEPS.length - 1;

  return (
    <section id="cara-kerja" className="scroll-mt-20 bg-white py-16 md:py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">Cara Kerja</span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Nggak ribet. Cuma 3 langkah dari connect akun sampai ambil keputusan.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Nggak perlu tim IT atau setup manual — begitu akun iklan tersambung, sisanya jalan otomatis.
          </p>
        </Reveal>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
          {HOW_IT_WORKS_STEPS.flatMap((step, i) => {
            const isLast = i === lastIndex;
            const nodes = [];

            if (i > 0) {
              nodes.push(
                <div key={`arrow-${i}`} className="flex items-center justify-center py-1 md:py-0">
                  <ArrowRight className="size-4 shrink-0 rotate-90 text-ink-3 md:rotate-0" />
                </div>,
              );
            }

            nodes.push(
              <Reveal
                key={step.title}
                className={`flex flex-1 flex-col gap-3 rounded-2xl p-6 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent hover:shadow-sm md:basis-1/3 ${
                  isLast ? "border border-accent/40 bg-accent-bg" : "border border-line bg-card"
                }`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-accent">
                  {i + 1}
                </div>
                <div className="text-[16.5px] font-bold">{step.title}</div>
                <p className="text-sm leading-relaxed text-ink-2">{step.desc}</p>
              </Reveal>,
            );

            return nodes;
          })}
        </div>
      </div>
    </section>
  );
}
