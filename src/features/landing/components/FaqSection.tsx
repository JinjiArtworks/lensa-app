import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";
import { FAQ_ITEMS } from "../mock-data";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-y border-line bg-card py-16 md:py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Pertanyaan yang Sering Ditanyakan
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Masih ada yang mengganjal? Ini beberapa jawabannya.
          </h2>
        </Reveal>
        <Reveal className="mx-auto max-w-[760px]">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group border-b border-line-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown className="size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180 group-open:text-accent-deep" />
              </summary>
              <div className="max-w-[640px] pb-5 text-[13.5px] leading-relaxed text-ink-2">{item.answer}</div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
