"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Step = "confirm" | "processing" | "success";

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("confirm");

  function handlePay() {
    setStep("processing");
    setTimeout(() => setStep("success"), 1800);
  }

  function handleClose() {
    setStep("confirm");
    onClose();
  }

  function handleContinue() {
    handleClose();
    router.push("/sign-in");
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && step !== "processing" && handleClose()}>
      <DialogContent>
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Mulai Langganan Pro</DialogTitle>
            </DialogHeader>
            <div className="mb-2 text-[10.5px] uppercase tracking-wide text-ink-3">Ringkasan Pembayaran</div>
            <div className="mb-4 rounded-xl border border-line bg-bg p-3.5">
              <div className="mb-2 flex justify-between text-[12.5px]">
                <span className="text-ink-2">Paket Pro (1 bulan)</span>
                <span className="font-bold">Rp149.000</span>
              </div>
              <div className="flex justify-between border-t border-line-2 pt-2 text-[12.5px]">
                <span className="text-ink-2">Multi-bisnis, unlimited platform, full AI Insight</span>
              </div>
            </div>
            <Button className="w-full justify-center" onClick={handlePay}>
              Bayar Rp149.000
            </Button>
            <div className="mt-2.5 text-center text-[10.5px] text-ink-3">
              🔒 Diproses aman lewat payment gateway (simulasi) — demo produk, tidak ada tagihan sungguhan
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="py-5 text-center">
            <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-line border-t-accent" />
            <h3 className="mb-1.5 text-sm font-bold">Menghubungkan ke payment gateway…</h3>
            <p className="text-xs text-ink-3">Ini simulasi — tidak ada kartu atau data pembayaran nyata yang diproses.</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-[52px] items-center justify-center rounded-full bg-green-bg text-green">
              ✓
            </div>
            <h3 className="mb-1 text-[15px] font-bold">Pembayaran Berhasil (Simulasi)</h3>
            <p className="mb-4 text-xs leading-relaxed text-ink-3">
              Langganan Pro kamu aktif. Lanjut masuk buat lihat dashboard-nya.
            </p>
            <Button className="w-full justify-center" onClick={handleContinue}>
              Lanjut ke Sign In
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
