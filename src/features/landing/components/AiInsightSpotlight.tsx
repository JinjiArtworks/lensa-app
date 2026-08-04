import { InsightCard } from "@/features/insight/components/InsightCard";
import { getInsightsForPeriod } from "@/features/insight/lib/insight-matcher";
import { Reveal } from "./Reveal";

// Public landing page has no signed-in business to scope data to — always
// shows the static demo anomaly, not a live per-viewer number.
const spotlightItem = getInsightsForPeriod("yesterday", undefined).find((item) => item.id === "yesterday-anomali-1")!;

export function AiInsightSpotlight() {
  return (
    <section className="py-16 md:py-[92px]">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 px-5 md:grid-cols-2 md:gap-14">
        <Reveal>
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">AI Insight</span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold leading-tight tracking-tight md:text-[36px]">
            Laporan AI yang langsung kasih tau apa yang berubah dan apa yang harus kamu lakukan.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Klik Sync, dan Lensa merangkum apa yang berubah dari data terbaru, kenapa itu penting buat bisnismu, dan
            apa yang sebaiknya kamu lakukan lebih dulu.
          </p>
          <p className="mt-6 text-[13px] leading-relaxed text-ink-2">
            Contoh di samping ini adalah tampilan asli fitur AI Insight di dalam produk Lensa — bukan mockup
            terpisah.
          </p>
        </Reveal>
        <Reveal>
          <InsightCard item={spotlightItem} />
        </Reveal>
      </div>
    </section>
  );
}
