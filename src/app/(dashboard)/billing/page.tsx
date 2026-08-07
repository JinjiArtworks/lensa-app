"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useBusinesses } from "@/features/app-shell/api/use-businesses";
import { PackageComparison } from "@/features/billing/components/PackageComparison";
import { PlanSummary } from "@/features/billing/components/PlanSummary";
import { PaymentGatewayModal } from "@/features/billing/components/PaymentGatewayModal";
import { useBusinessPlan } from "@/features/binding/api/use-connect-platform";
import { useUpdateBusinessPlan } from "@/features/billing/api/use-update-plan";
import type { BusinessPlan } from "@/lib/firebase/types";

function SectionLabel({ children }: { children: string }) {
  return <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-3">{children}</div>;
}

export default function BillingPage() {
  const showToast = useUiStore((s) => s.showToast);
  const uid = useAuthStore((s) => s.user?.uid);
  const { data: businesses = [] } = useBusinesses(uid);
  // The account's plan lives on the PRIMARY business (first one ever
  // registered, see BusinessSwitcher) — not whatever business happens to be
  // active in the switcher. Reading/writing off `activeBusinessId` here let a
  // downgrade performed while viewing a secondary business write to that
  // business's own doc instead of the one BusinessSwitcher's access gate
  // actually checks, so the account never looked downgraded and the extra
  // business stayed fully reachable.
  const primaryBusinessId = businesses[0]?.id;
  const { data: plan = "free" } = useBusinessPlan(primaryBusinessId);
  const updatePlan = useUpdateBusinessPlan(primaryBusinessId);
  const [paymentOpen, setPaymentOpen] = useState(false);

  function handleSelectPlan(next: BusinessPlan) {
    updatePlan.mutate(next, {
      onSuccess: () =>
        showToast(next === "pro" ? "Upgrade ke Pro berhasil (simulasi)" : "Plan diubah ke Free (simulasi)", "success"),
      onError: () => showToast("Gagal ganti plan, coba lagi", "error"),
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">Billing</h1>
          <div className="mt-0.5 text-xs text-ink-3">Plan, metode pembayaran, dan riwayat tagihan</div>
        </div>
        <Button variant="ghost" onClick={() => showToast("Invoice terbaru diunduh (simulasi)")}>
          <Download className="size-4" />
          Download invoice terakhir
        </Button>
      </div>

      <SectionLabel>Ringkasan</SectionLabel>
      <div className="mb-5">
        <PlanSummary businessId={primaryBusinessId} plan={plan} onOpenPayment={() => setPaymentOpen(true)} />
      </div>

      <div id="paket-tersedia">
        <SectionLabel>Paket Tersedia</SectionLabel>
        <PackageComparison plan={plan} onSelectPlan={handleSelectPlan} pending={updatePlan.isPending} />
      </div>

      <PaymentGatewayModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />

      <div className="mt-6 text-center text-[11px] text-ink-3">
        Halaman ini simulasi untuk keperluan demo — belum terhubung ke payment gateway sungguhan.
      </div>
    </div>
  );
}
