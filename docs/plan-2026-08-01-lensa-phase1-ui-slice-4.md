# Lensa — Phase 1 UI Slice 4: Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the mockup's Billing page into `/billing` — two sub-tabs ("Ringkasan": Pro plan card + payment method + invoice history; "Paket Tersedia": Free vs Pro comparison), plus the "Perpanjang Sekarang" mock payment-gateway modal (confirm → processing → success). Same UI-only phase: no Firebase/Firestore, no real payment gateway — everything is a client-side simulation matching the HTML mockup exactly, per `08-pricing-page.md`.

**Architecture:** One route `src/app/(dashboard)/billing/page.tsx` inside the dashboard shell. Sub-tabs are local `useState`, matching the pattern already used for Meta/TikTok switching in Detail Platform. The payment modal reuses the `Dialog` component (already built in Slice 1 Task 1) with an internal `step` state cycling `"confirm" → "processing" → "success"`.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind v3, shadcn/ui Dialog/Badge, Vitest + RTL with fake timers.

## Global Constraints

- **No Firebase/Firestore calls, no real payment gateway/API call anywhere.** The "Perpanjang Sekarang" flow is a pure `setTimeout`-based simulation, per `business-plan.md` §9's explicit decision ("bukan payment gateway fungsional... tetap murni UI").
- Accent color = amber/gold, this project's existing Tailwind tokens.
- Max 2 Zustand stores (`ui`+`auth`) — tab state and modal state are component-local `useState`.
- If any Tailwind class uses a fractional spacing value outside Tailwind v3's default scale (`4.5`/`6.5`/`7.5`/`15` are NOT valid; `0.5`/`1.5`/`2.5`/`3.5` ARE), substitute the nearest valid key and note it.
- No git repository in the parent `Assessment/` folder — every "commit" step is a manual checkpoint instead.
- When testing a component with `setTimeout` + local state via fake timers, wrap both the triggering click and the timer advance in `act()` from `"react"`.

---

## File Structure

- Create: `src/features/billing/mock-data.ts` (invoices)
- Create: `src/features/billing/components/BillingTabs.tsx`
- Create: `src/features/billing/components/PlanSummary.tsx`
- Create: `src/features/billing/components/PackageComparison.tsx`
- Create: `src/features/billing/components/PaymentGatewayModal.tsx`
- Create: `src/app/(dashboard)/billing/page.tsx`
- Test files alongside each component under `__tests__/`

---

## Task 1: Billing shell + Ringkasan tab (plan card, payment method, invoice table)

**Files:**
- Create: `src/features/billing/mock-data.ts`
- Create: `src/features/billing/components/BillingTabs.tsx`
- Create: `src/features/billing/components/PlanSummary.tsx`
- Create: `src/app/(dashboard)/billing/page.tsx`
- Test: `src/features/billing/components/__tests__/BillingTabs.test.tsx`, `PlanSummary.test.tsx`

**Interfaces:**
- Produces: `INVOICES` from `mock-data.ts` — consumed by `PlanSummary` in this task (invoice table) and available for Task 3's success-flow update.
- Produces: `BillingPage`'s local `tab` state (`"overview" | "packages"`) — Task 2's `PackageComparison` is rendered by the page when `tab === "packages"`, not managed by the tab component itself.

- [x] **Step 1: Write the invoice mock data**

Create `src/features/billing/mock-data.ts`:
```ts
export interface Invoice {
  date: string;
  desc: string;
  amount: string;
  status: "Lunas" | "Gagal";
}

export const INVOICES: Invoice[] = [
  { date: "1 Agu 2026", desc: "Langganan Pro — Agustus 2026", amount: "Rp149.000", status: "Lunas" },
  { date: "1 Jul 2026", desc: "Langganan Pro — Juli 2026", amount: "Rp149.000", status: "Lunas" },
  { date: "3 Jun 2026", desc: "Langganan Pro — Juni 2026 (percobaan ulang)", amount: "Rp149.000", status: "Lunas" },
  { date: "1 Jun 2026", desc: "Langganan Pro — Juni 2026", amount: "Rp149.000", status: "Gagal" },
  { date: "1 Mei 2026", desc: "Langganan Pro — Mei 2026", amount: "Rp149.000", status: "Lunas" },
];
```

- [x] **Step 2: Write the failing test for `BillingTabs`**

Create `src/features/billing/components/__tests__/BillingTabs.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { BillingTabs } from "../BillingTabs";

test("renders both tabs with Ringkasan active by default", () => {
  const onChange = vi.fn();
  render(<BillingTabs active="overview" onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Ringkasan" })).toHaveClass("bg-accent");
  expect(screen.getByRole("button", { name: "Paket Tersedia" })).not.toHaveClass("bg-accent");
});

test("clicking a tab calls onChange with that tab key", () => {
  const onChange = vi.fn();
  render(<BillingTabs active="overview" onChange={onChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Paket Tersedia" }));
  expect(onChange).toHaveBeenCalledWith("packages");
});
```

- [x] **Step 3: Run to verify failure, then implement `BillingTabs`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- BillingTabs
```
Expected: FAIL.

Create `src/features/billing/components/BillingTabs.tsx`:
```tsx
export type BillingTab = "overview" | "packages";

export function BillingTabs({
  active,
  onChange,
}: {
  active: BillingTab;
  onChange: (tab: BillingTab) => void;
}) {
  const tabs: { key: BillingTab; label: string }[] = [
    { key: "overview", label: "Ringkasan" },
    { key: "packages", label: "Paket Tersedia" },
  ];
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold ${
            t.key === active ? "border-accent bg-accent text-ink" : "border-line bg-card text-ink-2"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
```

- [x] **Step 4: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- BillingTabs
```
Expected: PASS, 2/2.

- [x] **Step 5: Write the failing test for `PlanSummary`**

Create `src/features/billing/components/__tests__/PlanSummary.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import { PlanSummary } from "../PlanSummary";

test("renders the active Pro plan, payment method, and 5 invoices", () => {
  render(<PlanSummary onOpenPayment={() => {}} />);
  expect(screen.getByText("AKTIF")).toBeInTheDocument();
  expect(screen.getByText("Rp149rb")).toBeInTheDocument();
  expect(screen.getByText("Visa •••• 4821")).toBeInTheDocument();
  expect(screen.getByText("Langganan Pro — Agustus 2026")).toBeInTheDocument();
  expect(screen.getByText("Langganan Pro — Mei 2026")).toBeInTheDocument();
  // NOTE: don't assert getAllByText("Rp149.000").toHaveLength(5) against the whole
  // page — the "Tagihan berikutnya ... Rp149.000 ..." line in the payment-method
  // card also contains this exact text, so the real page-wide count is 6, not 5.
  // Scope the count to the invoice history card via its data-testid instead.
  const invoiceCard = screen.getByTestId("invoice-history");
  expect(within(invoiceCard).getAllByText("Rp149.000")).toHaveLength(5);
});

test("clicking Perpanjang Sekarang calls onOpenPayment", () => {
  const onOpenPayment = vi.fn();
  render(<PlanSummary onOpenPayment={onOpenPayment} />);
  screen.getByRole("button", { name: "Perpanjang Sekarang" }).click();
  expect(onOpenPayment).toHaveBeenCalled();
});
```

- [x] **Step 6: Run to verify failure, then implement `PlanSummary`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlanSummary
```
Expected: FAIL.

Create `src/features/billing/components/PlanSummary.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INVOICES } from "../mock-data";

export function PlanSummary({ onOpenPayment }: { onOpenPayment: () => void }) {
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
            <Button variant="ghost" className="flex-1 justify-center">
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
            <div className="flex h-7.5 w-10.5 shrink-0 items-center justify-center rounded-md bg-accent-bg text-[10px] font-extrabold text-accent">
              VISA
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold">Visa •••• 4821</div>
              <div className="mt-0.5 text-[11.5px] text-ink-3">Kedaluwarsa 09/28 · a.n. Sinta Wijaya</div>
            </div>
            <Button variant="ghost" className="px-2.5 py-1.5 text-[11px]">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```
Note: `h-7.5`/`w-10.5` are not valid Tailwind v3 default scale keys — substitute `h-8`/`w-11` (or the arbitrary values `h-[30px]`/`w-[42px]` to match the mockup's exact pixel size) before running tests, or let the implementer catch and fix this.

- [x] **Step 7: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlanSummary
```
Expected: PASS, 2/2.

- [x] **Step 8: Assemble the Billing page**

Create `src/app/(dashboard)/billing/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { BillingTabs, type BillingTab } from "@/features/billing/components/BillingTabs";
import { PlanSummary } from "@/features/billing/components/PlanSummary";

export default function BillingPage() {
  const [tab, setTab] = useState<BillingTab>("overview");

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[23px] font-extrabold tracking-tight">Billing</h1>
        <div className="mt-0.5 text-xs text-ink-3">Plan, metode pembayaran, dan riwayat tagihan</div>
      </div>
      <BillingTabs active={tab} onChange={setTab} />
      {tab === "overview" && <PlanSummary onOpenPayment={() => {}} />}
      {/* Paket Tersedia tab (Task 2) and payment modal (Task 3) slot in here */}
    </div>
  );
}
```

- [x] **Step 9: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

---

## Task 2: Paket Tersedia tab (Free vs Pro comparison)

**Files:**
- Create: `src/features/billing/components/PackageComparison.tsx`
- Modify: `src/app/(dashboard)/billing/page.tsx`
- Test: `src/features/billing/components/__tests__/PackageComparison.test.tsx`

**Interfaces:**
- Produces: nothing consumed elsewhere — pure display component.

- [x] **Step 1: Write the failing test**

Create `src/features/billing/components/__tests__/PackageComparison.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { PackageComparison } from "../PackageComparison";

test("renders Free and Pro plan feature lists", () => {
  render(<PackageComparison />);
  expect(screen.getByText("Free")).toBeInTheDocument();
  expect(screen.getByText("Rp0")).toBeInTheDocument();
  expect(screen.getByText(/1 platform iklan/)).toBeInTheDocument();
  expect(screen.getByText("Rp149rb")).toBeInTheDocument();
  expect(screen.getByText(/Full AI Insight/)).toBeInTheDocument();
});
```

- [x] **Step 2: Run to verify failure, then implement `PackageComparison`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PackageComparison
```
Expected: FAIL.

Create `src/features/billing/components/PackageComparison.tsx`:
```tsx
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
          <p className="mb-2.5 text-[12.5px] text-ink-2">Cocok buat coba-coba pantau 1 platform iklan.</p>
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
```

- [x] **Step 3: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PackageComparison
```
Expected: PASS, 1/1.

- [x] **Step 4: Slot into the Billing page**

Modify `src/app/(dashboard)/billing/page.tsx`:
```tsx
import { PackageComparison } from "@/features/billing/components/PackageComparison";
// ...
      {tab === "overview" && <PlanSummary onOpenPayment={() => {}} />}
      {tab === "packages" && <PackageComparison />}
```

- [x] **Step 5: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

---

## Task 3: Payment gateway modal ("Perpanjang Sekarang")

**Files:**
- Create: `src/features/billing/components/PaymentGatewayModal.tsx`
- Modify: `src/features/billing/mock-data.ts` (make `INVOICES` a mutable module-level array, matching the same "mutate shared mock state" pattern already used by Overview's `TARGETS`/`SetTargetModal`)
- Modify: `src/app/(dashboard)/billing/page.tsx`
- Test: `src/features/billing/components/__tests__/PaymentGatewayModal.test.tsx`

**Interfaces:**
- Consumes: `Dialog`/`DialogContent` from `@/components/ui/dialog`, `INVOICES` from `../mock-data`.
- Produces: nothing consumed elsewhere — closes out the Billing page for this plan.

- [x] **Step 1: Write the failing test**

Create `src/features/billing/components/__tests__/PaymentGatewayModal.test.tsx`:
```tsx
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { PaymentGatewayModal } from "../PaymentGatewayModal";

test("shows the confirm step with payment summary when opened", () => {
  render(<PaymentGatewayModal open={true} onClose={() => {}} />);
  expect(screen.getByText("Perpanjang Langganan")).toBeInTheDocument();
  expect(screen.getByText("Rp149.000")).toBeInTheDocument();
  expect(screen.getByText("Visa •••• 4821")).toBeInTheDocument();
});

test("clicking Bayar shows processing then success, and appends a new invoice", () => {
  vi.useFakeTimers();
  render(<PaymentGatewayModal open={true} onClose={() => {}} />);
  act(() => {
    screen.getByRole("button", { name: /Bayar Rp149.000/ }).click();
  });
  expect(screen.getByText(/Menghubungkan ke payment gateway/)).toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(1800);
  });
  expect(screen.getByText("Pembayaran Berhasil")).toBeInTheDocument();
  vi.useRealTimers();
});
```

- [x] **Step 2: Run to verify failure**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PaymentGatewayModal
```
Expected: FAIL (module not found).

- [x] **Step 3: Make `INVOICES` mutable and implement the modal**

Modify `src/features/billing/mock-data.ts` — no structural change needed, `INVOICES` is already a plain mutable array (`.unshift()` works on it as-is); just confirm this in your implementation, no edit required here.

Create `src/features/billing/components/PaymentGatewayModal.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { INVOICES } from "../mock-data";

type Step = "confirm" | "processing" | "success";

export function PaymentGatewayModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>("confirm");

  function handlePay() {
    setStep("processing");
    setTimeout(() => {
      INVOICES.unshift({
        date: "1 Agu 2026",
        desc: "Perpanjangan manual — Pro",
        amount: "Rp149.000",
        status: "Lunas",
      });
      setStep("success");
    }, 1800);
  }

  function handleClose() {
    setStep("confirm");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && step !== "processing" && handleClose()}>
      <DialogContent>
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Perpanjang Langganan</DialogTitle>
            </DialogHeader>
            <div className="mb-2 text-[10.5px] uppercase tracking-wide text-ink-3">Ringkasan Pembayaran</div>
            <div className="mb-4 rounded-xl border border-line bg-bg p-3.5">
              <div className="mb-2 flex justify-between text-[12.5px]">
                <span className="text-ink-2">Paket Pro (1 bulan)</span>
                <span className="font-bold">Rp149.000</span>
              </div>
              <div className="flex justify-between border-t border-line-2 pt-2 text-[12.5px]">
                <span className="text-ink-2">Metode pembayaran</span>
                <span className="font-semibold">Visa •••• 4821</span>
              </div>
            </div>
            <Button className="w-full justify-center" onClick={handlePay}>
              Bayar Rp149.000
            </Button>
            <div className="mt-2.5 text-center text-[10.5px] text-ink-3">
              🔒 Diproses aman lewat payment gateway (simulasi)
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="py-5 text-center">
            <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-line border-t-accent" />
            <h3 className="mb-1.5 text-sm font-bold">Menghubungkan ke payment gateway…</h3>
            <p className="text-xs text-ink-3">Memverifikasi kartu Visa •••• 4821. Jangan tutup halaman ini.</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-13 items-center justify-center rounded-full bg-green-bg text-green">
              ✓
            </div>
            <h3 className="mb-1 text-[15px] font-bold">Pembayaran Berhasil</h3>
            <p className="mb-4.5 text-xs leading-relaxed text-ink-3">
              Langganan Pro kamu diperpanjang sampai <b className="text-ink-2">1 Oktober 2026</b>. Invoice sudah
              dikirim ke sinta@tokobaju.com.
            </p>
            <Button className="w-full justify-center" onClick={handleClose}>
              Selesai
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```
Note: `size-13` and `mb-4.5` are not valid Tailwind v3 default scale keys — substitute `size-[52px]` (matching the mockup's exact 52px circle) and `mb-4` respectively before running tests, or let the implementer catch and fix this.

- [x] **Step 4: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PaymentGatewayModal
```
Expected: PASS, 2/2.

- [x] **Step 5: Wire the modal into the Billing page**

Modify `src/app/(dashboard)/billing/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { BillingTabs, type BillingTab } from "@/features/billing/components/BillingTabs";
import { PlanSummary } from "@/features/billing/components/PlanSummary";
import { PackageComparison } from "@/features/billing/components/PackageComparison";
import { PaymentGatewayModal } from "@/features/billing/components/PaymentGatewayModal";

export default function BillingPage() {
  const [tab, setTab] = useState<BillingTab>("overview");
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[23px] font-extrabold tracking-tight">Billing</h1>
        <div className="mt-0.5 text-xs text-ink-3">Plan, metode pembayaran, dan riwayat tagihan</div>
      </div>
      <BillingTabs active={tab} onChange={setTab} />
      {tab === "overview" && <PlanSummary onOpenPayment={() => setPaymentOpen(true)} />}
      {tab === "packages" && <PackageComparison />}
      <PaymentGatewayModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}
```

- [x] **Step 6: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

- [x] **Step 7: Manual checkpoint**

`npm run dev`, visit `/billing`. Confirm: Ringkasan tab shows Pro plan card, payment method, 5-row invoice history; Paket Tersedia tab shows Free vs Pro comparison + mock disclaimer footer; clicking "Perpanjang Sekarang" opens the modal, clicking "Bayar" shows a spinner (~1.8s) then a success screen, and after closing, the Riwayat Invoice table on the Ringkasan tab has a new 6th row at the top ("Perpanjangan manual — Pro").

---

## Self-Review Notes

**Spec coverage against `08-pricing-page.md`:** Free vs Pro comparison ✅ visual, not just text. Simulated payment flow ✅ (update tier — not literally applicable since this project doesn't yet have a tier-mutation concern beyond the invoice list, which IS updated). Accessible from Billing ✅; accessible from "upgrade prompt manapun di app" — **not built** (Business Switcher's "+Tambah Bisnis" doesn't link here yet, deferred). Footer "mock/simulasi" disclaimer ✅ added in Task 2.

**Deferred, not forgotten:** the Free→Pro *upgrade* flow triggered from a limit-gate (e.g. Business Switcher blocking a 2nd business on Free tier) is a different flow from this plan's "Perpanjang Sekarang" (which is a *renewal* of an already-active Pro plan) — still not built, consistent with what `PROGRESS.md` already notes.
