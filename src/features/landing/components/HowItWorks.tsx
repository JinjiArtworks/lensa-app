import { Reveal } from "./Reveal";
import { HOW_IT_WORKS_STEPS } from "../mock-data";

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 py-16 md:py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">Cara Kerja</span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Dari akun yang terpisah, jadi satu alur yang jelas — cuma 3 langkah.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <Reveal key={step.title}>
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-ink font-display text-base font-bold text-accent">
                {i + 1}
              </div>
              <div className="text-[16.5px] font-bold">{step.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
