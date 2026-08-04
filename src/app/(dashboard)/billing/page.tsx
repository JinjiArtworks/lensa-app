"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";
import { BillingTabs, type BillingTab } from "@/features/billing/components/BillingTabs";
import { PackageComparison } from "@/features/billing/components/PackageComparison";
import { PlanSummary } from "@/features/billing/components/PlanSummary";
import { PaymentGatewayModal } from "@/features/billing/components/PaymentGatewayModal";

export default function BillingPage() {
  const showToast = useUiStore((s) => s.showToast);
  const [tab, setTab] = useState<BillingTab>("overview");
  const [paymentOpen, setPaymentOpen] = useState(false);

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
      {tab === "overview" && <PlanSummary onOpenPayment={() => setPaymentOpen(true)} />}
      {tab === "packages" && <PackageComparison />}
      <PaymentGatewayModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}
