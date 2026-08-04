const FREE_FEATURES = [
  { text: "1 platform iklan (pilih Meta Ads atau TikTok Ads)", included: true },
  { text: "1 pengguna, tanpa invite anggota tim", included: true },
  { text: "AI Insight dasar — kategori Positif saja", included: true },
  { text: "Histori data 7 hari terakhir", included: true },
  { text: "Tanpa export & copy as report", included: false },
  { text: "Tanpa multi-bisnis", included: false },
];

const PRO_FEATURES = [
  "Meta Ads & TikTok Ads otomatis terhubung",
  "Multi-bisnis & unlimited anggota tim",
  "Full AI Insight — anomali, rekomendasi & positif",
  "Export laporan & copy as report",
  "Histori data penuh, tanpa batas",
];

export function PackageComparison() {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold">Paket Tersedia</h3>
        <div className="mt-0.5 text-[11.5px] text-ink-3">
          Bandingkan benefit tiap paket Lensa. Upgrade/downgrade dikelola lewat metode pembayaran.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <div className="rounded-2xl border border-line bg-bg p-4">
          <h3 className="text-sm font-bold">Free</h3>
          <div className="my-2 text-xl font-extrabold">
            Rp0<span className="text-xs font-normal text-ink-3">/bulan</span>
          </div>
          <p className="mb-2.5 text-[12.5px] text-ink-2">Cocok buat coba-coba pantau satu platform iklan.</p>
          <ul className="flex flex-col gap-2 text-[12.5px]">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className={f.included ? "text-ink-2" : "text-ink-3"}>
                {f.included ? "✓" : "✕"} {f.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-accent bg-card p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            Pro <span className="rounded bg-accent px-1.5 py-0.5 text-[9.5px] font-extrabold text-ink">AKTIF</span>
          </h3>
          <div className="my-2 text-xl font-extrabold">
            Rp149rb<span className="text-xs font-normal text-ink-3">/bulan</span>
          </div>
          <p className="mb-2.5 text-[12.5px] text-ink-2">Buat bisnis yang serius optimasi lintas platform.</p>
          <ul className="flex flex-col gap-2 text-[12.5px] text-ink-2">
            {PRO_FEATURES.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 border-t border-line-2 pt-3 text-center text-[10.5px] text-ink-3">
        Halaman ini mock/simulasi untuk keperluan demo — bukan alur upgrade/downgrade fungsional.
      </div>
    </div>
  );
}
