"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";
import { BillingTabs, type BillingTab } from "@/features/billing/components/BillingTabs";
import { PackageComparison } from "@/features/billing/components/PackageComparison";
import { PlanSummary } from "@/features/billing/components/PlanSummary";
import { PaymentGatewayModal } from "@/features/billing/components/PaymentGatewayModal";
import { useBusinessPlan } from "@/features/connect-platform/api/use-connect-platform";
import { useUpdateBusinessPlan } from "@/features/billing/api/use-update-plan";
import type { BusinessPlan } from "@/lib/firebase/types";

export default function BillingPage() {
  const showToast = useUiStore((s) => s.showToast);
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { data: plan = "free" } = useBusinessPlan(activeBusinessId);
  const updatePlan = useUpdateBusinessPlan(activeBusinessId);
  const [tab, setTab] = useState<BillingTab>("overview");
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
      <BillingTabs active={tab} onChange={setTab} />
      {tab === "overview" && (
        <PlanSummary plan={plan} onOpenPayment={() => setPaymentOpen(true)} onViewPackages={() => setTab("packages")} />
      )}
      {tab === "packages" && (
        <PackageComparison plan={plan} onSelectPlan={handleSelectPlan} pending={updatePlan.isPending} />
      )}
      <PaymentGatewayModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}
