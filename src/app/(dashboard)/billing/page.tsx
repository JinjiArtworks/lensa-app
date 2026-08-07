"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useBusinesses } from "@/features/app-shell/api/use-businesses";
import { PackageComparison } from "@/features/billing/components/PackageComparison";
import { PlanSummary } from "@/features/billing/components/PlanSummary";
import { PaymentGatewayModal } from "@/features/billing/components/PaymentGatewayModal";
import { useBusinessPlan, useConnectedPlatforms } from "@/features/binding/api/use-connect-platform";
import { useUpdateBusinessPlan } from "@/features/billing/api/use-update-plan";
import { PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";
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
  const primaryBusiness = businesses[0];
  const primaryBusinessId = primaryBusiness?.id;
  const { data: plan = "free" } = useBusinessPlan(primaryBusinessId);
  const { data: primaryConnectedPlatforms = [] } = useConnectedPlatforms(primaryBusinessId);
  const updatePlan = useUpdateBusinessPlan(primaryBusinessId);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingDowngrade, setPendingDowngrade] = useState(false);

  function applyPlanChange(next: BusinessPlan) {
    updatePlan.mutate(next, {
      onSuccess: () =>
        showToast(next === "pro" ? "Upgrade ke Pro berhasil (simulasi)" : "Plan diubah ke Free (simulasi)", "success"),
      onError: () => showToast("Gagal ganti plan, coba lagi", "error"),
    });
  }

  function handleSelectPlan(next: BusinessPlan) {
    // Downgrading re-enforces the 1-platform limit on the primary business —
    // silently dropping a platform that was bound (e.g. while Pro) surprised
    // users who didn't realize plan is account-wide, not tied to whatever
    // business they were viewing when they clicked. Confirm first whenever
    // there's actually something to lose.
    if (next === "free" && primaryConnectedPlatforms.length > 1) {
      setPendingDowngrade(true);
      return;
    }
    applyPlanChange(next);
  }

  function confirmDowngrade() {
    setPendingDowngrade(false);
    applyPlanChange("free");
  }

  const keptPlatform = primaryConnectedPlatforms[0] as PlatformKey | undefined;
  const droppedPlatformNames = primaryConnectedPlatforms
    .slice(1)
    .map((key) => PLATFORM_LABELS[key as PlatformKey]?.name)
    .filter(Boolean)
    .join(", ");

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

      <Dialog open={pendingDowngrade} onOpenChange={(o) => !o && setPendingDowngrade(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Downgrade ke Free?</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-[12.5px] leading-relaxed text-ink-2">
            Plan berlaku buat seluruh akunmu, disimpen di bisnis pertama kamu (<b>{primaryBusiness?.name}</b>). Plan
            Free cuma bisa 1 platform aktif — <b>{droppedPlatformNames}</b> bakal ke-lepas dari{" "}
            <b>{primaryBusiness?.name}</b>, cuma <b>{keptPlatform ? PLATFORM_LABELS[keptPlatform].name : ""}</b> yang
            tetap kebind. Kamu bisa hubungin lagi manual abis upgrade ke Pro.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="destructive" className="w-full justify-center" onClick={confirmDowngrade}>
              Ya, Downgrade
            </Button>
            <Button variant="ghost" className="w-full justify-center" onClick={() => setPendingDowngrade(false)}>
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-6 text-center text-[11px] text-ink-3">
        Halaman ini simulasi untuk keperluan demo — belum terhubung ke payment gateway sungguhan.
      </div>
    </div>
  );
}
