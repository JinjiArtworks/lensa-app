import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";
import type { BusinessPlan } from "@/lib/firebase/types";
import { INVOICES } from "../mock-data";

export function PlanSummary({
  plan,
  onOpenPayment,
  onViewPackages,
}: {
  plan: BusinessPlan;
  onOpenPayment: () => void;
  onViewPackages: () => void;
}) {
  const showToast = useUiStore((s) => s.showToast);

  if (plan === "free") {
    return (
      <div className="rounded-2xl border border-line bg-card p-4">
        <h3 className="text-sm font-bold">
          Free <span className="rounded bg-gray-bg px-1.5 py-0.5 text-[9.5px] font-extrabold text-ink-2">AKTIF</span>
        </h3>
        <div className="my-2.5 text-[22px] font-extrabold">
          Rp0<span className="text-xs font-normal text-ink-3">/bulan</span>
        </div>
        <p className="mb-3.5 max-w-[420px] text-[12.5px] text-ink-2">
          Kamu di plan Free — 1 platform, 1 pengguna, AI Insight dasar. Upgrade ke Pro buat multi-bisnis, semua
          platform terhubung sekaligus, dan export laporan.
        </p>
        <Button onClick={onViewPackages}>Lihat Paket Pro</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <div className="rounded-2xl border-2 border-accent bg-card p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            Pro <span className="rounded bg-accent px-1.5 py-0.5 text-[9.5px] font-extrabold text-ink">AKTIF</span>
          </h3>
          <div className="my-2.5 text-[22px] font-extrabold">
            Rp149rb<span className="text-xs font-normal text-ink-3">/bulan</span>
          </div>
          <p className="mb-1.5 text-[12.5px] text-ink-2">
            Multi-bisnis · Meta Ads &amp; TikTok Ads terhubung otomatis · full AI Insight + export
          </p>
          <p className="mb-3.5 text-[11.5px] text-ink-3">
            Perpanjang otomatis <b className="text-ink-2">1 September 2026</b> · ditagih bulanan
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 justify-center"
              onClick={() => showToast("Halaman metode pembayaran dibuka (simulasi)")}
            >
              Kelola metode pembayaran
            </Button>
            <Button className="flex-1 justify-center" onClick={onOpenPayment}>
              Perpanjang Sekarang
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4">
          <h3 className="mb-3.5 text-sm font-bold">Metode Pembayaran</h3>
          <div className="flex items-center gap-3">
            <div className="flex h-[30px] w-[42px] shrink-0 items-center justify-center rounded-md bg-accent-bg text-[10px] font-extrabold text-accent">
              VISA
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold">Visa •••• 4821</div>
              <div className="mt-0.5 text-[11.5px] text-ink-3">Kedaluwarsa 09/28 · a.n. Sinta Wijaya</div>
            </div>
            <Button
              variant="ghost"
              className="px-2.5 py-1.5 text-[11px]"
              onClick={() => showToast("Ganti metode pembayaran (simulasi)")}
            >
              Ganti
            </Button>
          </div>
          <div className="mt-3.5 border-t border-line-2 pt-3 text-[11.5px] leading-relaxed text-ink-3">
            Tagihan berikutnya <b className="text-ink-2">Rp149.000</b> pada <b className="text-ink-2">1 September 2026</b>.
            Kami kirim invoice ke sinta@tokobaju.com.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-card p-4" data-testid="invoice-history">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="text-sm font-bold">Riwayat Invoice</h3>
          <span className="text-[11.5px] text-ink-3">5 tagihan terakhir</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Tanggal</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Deskripsi</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Jumlah</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Status</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((iv) => (
                <tr key={iv.date + iv.desc} className="border-b border-line-2 last:border-b-0">
                  <td className="px-2 py-3 text-xs">{iv.date}</td>
                  <td className="px-2 py-3 text-xs">{iv.desc}</td>
                  <td className="px-2 py-3 text-right text-xs">{iv.amount}</td>
                  <td className="px-2 py-3">
                    <Badge variant={iv.status === "Lunas" ? "active" : "archived"}>{iv.status}</Badge>
                  </td>
                  <td className="px-2 py-3 text-right text-xs">
                    <button
                      type="button"
                      onClick={() => showToast(`Invoice ${iv.date} diunduh (simulasi)`)}
                      className="text-accent-text underline decoration-line underline-offset-2"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
