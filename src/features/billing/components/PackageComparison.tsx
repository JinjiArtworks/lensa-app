import { Button } from "@/components/ui/button";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import type { BusinessPlan } from "@/lib/firebase/types";

const FREE_FEATURES = [
  { text: "1 bisnis", included: true },
  { text: "1 platform iklan (pilih Meta Ads atau TikTok Ads)", included: true },
  { text: "AI Insight dasar — kategori Positif saja", included: true },
  { text: "Tanpa export & copy as report", included: false },
  { text: "Tanpa multi-bisnis", included: false },
];

const PRO_FEATURES = [
  "Meta Ads & TikTok Ads otomatis terhubung",
  "Multi-bisnis",
  "Full AI Insight — perlu aksi, rekomendasi & positif",
  "Export laporan & copy as report",
];

export function PackageComparison({
  plan,
  onSelectPlan,
  pending,
}: {
  plan: BusinessPlan;
  onSelectPlan: (plan: BusinessPlan) => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold">Paket Tersedia</h3>
        <div className="mt-0.5 text-[11.5px] text-ink-3">
          Bandingkan benefit tiap paket Lensa. Upgrade/downgrade dikelola lewat metode pembayaran.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <div className={`rounded-2xl border p-4 ${plan === "free" ? "border-2 border-accent bg-card" : "border-line bg-bg"}`}>
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            Free
            {plan === "free" && (
              <span className="rounded bg-accent px-1.5 py-0.5 text-[9.5px] font-extrabold text-ink">AKTIF</span>
            )}
          </h3>
          <div className="my-2 text-xl font-extrabold">
            Rp0<span className="text-xs font-normal text-ink-3">/bulan</span>
          </div>
          <p className="mb-2.5 text-[12.5px] text-ink-2">Cocok buat coba-coba pantau satu platform iklan.</p>
          <ul className="mb-3.5 flex flex-col gap-2 text-[12.5px]">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className={`flex items-center gap-1.5 ${f.included ? "text-ink-2" : "text-ink-3"}`}>
                {f.included ? "✓" : "✕"} {f.text}
                {!f.included && <ProLockBadge tooltip="Fitur Pro — upgrade buat buka akses" />}
              </li>
            ))}
          </ul>
          {plan !== "free" && (
            <Button
              variant="outline"
              className="w-full justify-center"
              disabled={pending}
              onClick={() => onSelectPlan("free")}
            >
              Downgrade ke Free
            </Button>
          )}
        </div>
        <div className={`rounded-2xl border p-4 ${plan === "pro" ? "border-2 border-accent bg-card" : "border-line bg-bg"}`}>
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            Pro
            {plan === "pro" && (
              <span className="rounded bg-accent px-1.5 py-0.5 text-[9.5px] font-extrabold text-ink">AKTIF</span>
            )}
          </h3>
          <div className="my-2 text-xl font-extrabold">
            Rp149.000<span className="text-xs font-normal text-ink-3">/bulan</span>
          </div>
          <p className="mb-2.5 text-[12.5px] text-ink-2">Buat bisnis yang serius optimasi lintas platform.</p>
          <ul className="mb-3.5 flex flex-col gap-2 text-[12.5px] text-ink-2">
            {PRO_FEATURES.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
          {plan !== "pro" && (
            <Button className="w-full justify-center" disabled={pending} onClick={() => onSelectPlan("pro")}>
              Upgrade ke Pro
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4 border-t border-line-2 pt-3 text-center text-[10.5px] text-ink-3">
        Plan ini berlaku buat seluruh akunmu (disimpen di bisnis pertama kamu), bukan cuma bisnis yang lagi aktif —
        simulasi, tanpa payment gateway beneran.
      </div>
    </div>
  );
}
