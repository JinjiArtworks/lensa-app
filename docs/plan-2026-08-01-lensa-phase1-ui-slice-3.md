# Lensa — Phase 1 UI Slice 3: Detail Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the mockup's Detail Platform page (`04-platform-detail-dashboard.md`) into `/detail` — platform switcher (Meta/TikTok chips), 8-metric KPI grid with percentage deltas, a Tren Performa line chart (Spend/Closing toggle), and a campaign table filtered to the selected platform. Same UI-only phase as Slices 1-2: no Firebase/Firestore, mock data only.

**Architecture:** One new route `src/app/(dashboard)/detail/page.tsx` inside the existing dashboard shell (so it gets Sidebar/TopBar automatically). Reuses `PLATFORMS` and `CAMPAIGNS` from `src/features/overview-dashboard/mock-data.ts` directly (cross-feature import) rather than duplicating — this is a deliberate, documented choice: both features genuinely operate on the same platform/campaign domain data, and this project is small enough that a shared-data refactor isn't worth the time cost tonight. Chart reuses the same Recharts `AreaChart` pattern already established by `TrendChart.tsx` in Overview, just with new per-platform data.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind v3, Recharts, Vitest + RTL.

## Global Constraints

- **No Firebase/Firestore calls anywhere in this plan.** Same as Slices 1-2.
- No "Compare 2 Platform" mode — cut from scope (`business-plan.md` §9). This page is single-platform drill-down only.
- Accent color = amber/gold, this project's existing Tailwind tokens.
- Max 2 Zustand stores (`ui`+`auth`) — active platform selection is component-local `useState`, not a new store.
- If any Tailwind class uses a fractional spacing value outside Tailwind v3's default scale (`4.5`/`6.5`/`7.5`/`15` are NOT valid; `0.5`/`1.5`/`2.5`/`3.5` ARE), substitute the nearest valid key and note it — established pattern, not a blocker. This plan's own code was written avoiding the invalid ones already; still double-check.
- No git repository in the parent `Assessment/` folder — every "commit" step is a manual checkpoint instead.

---

## File Structure

- Create: `src/features/detail-platform/components/PlatformSwitcher.tsx`
- Create: `src/features/detail-platform/components/PlatformKpiGrid.tsx`
- Create: `src/features/detail-platform/components/PlatformTrendChart.tsx`
- Create: `src/features/detail-platform/components/PlatformCampaignTable.tsx`
- Create: `src/features/detail-platform/mock-data.ts` (trend series only — KPI/campaign data is imported from `overview-dashboard`, not duplicated)
- Create: `src/app/(dashboard)/detail/page.tsx`
- Test files alongside each component under `__tests__/`

---

## Task 1: Platform switcher + KPI grid

**Files:**
- Create: `src/features/detail-platform/components/PlatformSwitcher.tsx`
- Create: `src/features/detail-platform/components/PlatformKpiGrid.tsx`
- Create: `src/app/(dashboard)/detail/page.tsx`
- Test: `src/features/detail-platform/components/__tests__/PlatformSwitcher.test.tsx`, `PlatformKpiGrid.test.tsx`

**Interfaces:**
- Consumes: `PLATFORMS` from `@/features/overview-dashboard/mock-data` (already has `meta`/`tiktok` keys, each with `name`, `ic`, and 8 `metrics` entries with `{value, cls, sub}` — built in UI Slice 1 Task 3).
- Produces: `DetailPlatformPage`'s local `selectedPlatform` state (`"meta" | "tiktok"`) — Task 2's chart/table components receive this as a prop from the page, they don't manage it themselves.

- [x] **Step 1: Write the failing test for `PlatformSwitcher`**

Create `src/features/detail-platform/components/__tests__/PlatformSwitcher.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { PlatformSwitcher } from "../PlatformSwitcher";

test("renders a chip per platform with the active one highlighted", () => {
  const onSelect = vi.fn();
  render(<PlatformSwitcher active="meta" onSelect={onSelect} />);
  expect(screen.getByRole("button", { name: /Meta Ads/i })).toHaveClass("bg-accent");
  expect(screen.getByRole("button", { name: /TikTok Ads/i })).not.toHaveClass("bg-accent");
});

test("clicking a chip calls onSelect with that platform key", () => {
  const onSelect = vi.fn();
  render(<PlatformSwitcher active="meta" onSelect={onSelect} />);
  fireEvent.click(screen.getByRole("button", { name: /TikTok Ads/i }));
  expect(onSelect).toHaveBeenCalledWith("tiktok");
});
```

- [x] **Step 2: Run to verify failure**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformSwitcher
```
Expected: FAIL (module not found).

- [x] **Step 3: Implement `PlatformSwitcher`**

Create `src/features/detail-platform/components/PlatformSwitcher.tsx`:
```tsx
import { PLATFORMS } from "@/features/overview-dashboard/mock-data";

export type PlatformKey = keyof typeof PLATFORMS;

export function PlatformSwitcher({
  active,
  onSelect,
}: {
  active: PlatformKey;
  onSelect: (key: PlatformKey) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {(Object.keys(PLATFORMS) as PlatformKey[]).map((key) => {
        const p = PLATFORMS[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12.5px] font-semibold ${
              key === active ? "border-accent bg-accent text-ink" : "border-line bg-card text-ink-2"
            }`}
          >
            <span
              className={`flex size-4.5 items-center justify-center rounded text-[9px] font-extrabold ${
                key === active ? "bg-black/10 text-ink" : "bg-gray-bg text-ink-2"
              }`}
            >
              {p.ic}
            </span>
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
```
Note: `size-4.5` is not a valid Tailwind v3 default scale key (per Global Constraints) — substitute `size-5` before running tests, or let the implementer catch and fix this per the established pattern.

- [x] **Step 4: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformSwitcher
```
Expected: PASS, 2/2.

- [x] **Step 5: Write the failing test for `PlatformKpiGrid`**

Create `src/features/detail-platform/components/__tests__/PlatformKpiGrid.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { PlatformKpiGrid } from "../PlatformKpiGrid";

test("renders all 8 metrics for the given platform with their delta text", () => {
  render(<PlatformKpiGrid platformKey="tiktok" />);
  expect(screen.getByText("Spend")).toBeInTheDocument();
  expect(screen.getByText("Rp1,4jt")).toBeInTheDocument();
  expect(screen.getByText("▲ 32% vs periode lalu")).toBeInTheDocument();
  expect(screen.getByText("Campaign Aktif")).toBeInTheDocument();
  expect(screen.getByText("Tidak ada perubahan")).toBeInTheDocument();
});
```

- [x] **Step 6: Run to verify failure, then implement `PlatformKpiGrid`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformKpiGrid
```
Expected: FAIL.

Create `src/features/detail-platform/components/PlatformKpiGrid.tsx`:
```tsx
import { PLATFORMS } from "@/features/overview-dashboard/mock-data";
import type { PlatformKey } from "./PlatformSwitcher";

export function PlatformKpiGrid({ platformKey }: { platformKey: PlatformKey }) {
  const metrics = PLATFORMS[platformKey].metrics;

  return (
    <div className="mb-4 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
      {Object.entries(metrics).map(([label, m]) => (
        <div key={label} className="rounded-2xl border border-line bg-card p-4">
          <div className="mb-2 text-xs text-ink-2">{label}</div>
          <div className="mb-1.5 text-xl font-extrabold tracking-tight">{m.value}</div>
          <div
            className={`text-[11px] font-semibold ${
              m.cls === "up" ? "text-green" : m.cls === "down" ? "text-red" : "text-ink-2"
            }`}
          >
            {m.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [x] **Step 7: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformKpiGrid
```
Expected: PASS, 1/1.

- [x] **Step 8: Assemble the Detail Platform page with what exists so far**

Create `src/app/(dashboard)/detail/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { PLATFORMS } from "@/features/overview-dashboard/mock-data";
import { PlatformSwitcher, type PlatformKey } from "@/features/detail-platform/components/PlatformSwitcher";
import { PlatformKpiGrid } from "@/features/detail-platform/components/PlatformKpiGrid";

export default function DetailPlatformPage() {
  const [platform, setPlatform] = useState<PlatformKey>("meta");

  return (
    <div>
      <div className="mb-4.5">
        <h1 className="text-[23px] font-extrabold tracking-tight">Detail Platform</h1>
        <div className="mt-0.5 text-xs text-ink-3">Drill-down performa per platform</div>
      </div>
      <PlatformSwitcher active={platform} onSelect={setPlatform} />
      <h2 className="mb-3 text-[17px] font-bold">{PLATFORMS[platform].name}</h2>
      <PlatformKpiGrid platformKey={platform} />
      {/* Trend chart + campaign table (Task 2) slot in below this line */}
    </div>
  );
}
```
Note: `mb-4.5` is not a valid Tailwind v3 scale key — substitute `mb-4` per the established pattern.

- [x] **Step 9: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

---

## Task 2: Trend chart + campaign table

**Files:**
- Create: `src/features/detail-platform/mock-data.ts`
- Create: `src/features/detail-platform/components/PlatformTrendChart.tsx`
- Create: `src/features/detail-platform/components/PlatformCampaignTable.tsx`
- Modify: `src/app/(dashboard)/detail/page.tsx`
- Test: `src/features/detail-platform/components/__tests__/PlatformTrendChart.test.tsx`, `PlatformCampaignTable.test.tsx`

**Interfaces:**
- Consumes: `CAMPAIGNS` and `Campaign`/`CampaignStatus`/`STATUS_LABEL`/`formatRupiah` from `@/features/overview-dashboard/mock-data` (built in UI Slice 1 Task 5). Consumes `Badge` from `@/components/ui/badge`.
- Produces: nothing consumed elsewhere — this closes out the Detail Platform page for this plan.

- [x] **Step 1: Write the per-platform trend mock data**

Create `src/features/detail-platform/mock-data.ts`:
```ts
export const PLATFORM_TREND: Record<"meta" | "tiktok", { day: string; spend: number; closing: number }[]> = {
  meta: [
    { day: "1", spend: 340, closing: 5 },
    { day: "2", spend: 360, closing: 5 },
    { day: "3", spend: 355, closing: 6 },
    { day: "4", spend: 380, closing: 6 },
    { day: "5", spend: 395, closing: 7 },
    { day: "6", spend: 410, closing: 7 },
    { day: "7", spend: 430, closing: 8 },
  ],
  tiktok: [
    { day: "1", spend: 210, closing: 3 },
    { day: "2", spend: 230, closing: 3 },
    { day: "3", spend: 260, closing: 4 },
    { day: "4", spend: 290, closing: 3 },
    { day: "5", spend: 330, closing: 3 },
    { day: "6", spend: 360, closing: 4 },
    { day: "7", spend: 400, closing: 4 },
  ],
};

export const PLATFORM_CHART_COLOR: Record<"meta" | "tiktok", string> = {
  meta: "#f0b400",
  tiktok: "#4f8cff",
};
```

- [x] **Step 2: Write the failing test for `PlatformTrendChart`**

Create `src/features/detail-platform/components/__tests__/PlatformTrendChart.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { PlatformTrendChart } from "../PlatformTrendChart";

test("defaults to Spend metric active and shows the platform legend", () => {
  render(<PlatformTrendChart platformKey="tiktok" />);
  expect(screen.getByRole("button", { name: "Spend" })).toHaveClass("bg-accent");
  expect(screen.getByText("TikTok Ads")).toBeInTheDocument();
});

test("clicking Closing switches the active toggle", () => {
  render(<PlatformTrendChart platformKey="meta" />);
  fireEvent.click(screen.getByRole("button", { name: "Closing" }));
  expect(screen.getByRole("button", { name: "Closing" })).toHaveClass("bg-accent");
});
```

- [x] **Step 3: Run to verify failure, then implement `PlatformTrendChart`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformTrendChart
```
Expected: FAIL.

Create `src/features/detail-platform/components/PlatformTrendChart.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";
import { PLATFORMS } from "@/features/overview-dashboard/mock-data";
import { PLATFORM_TREND, PLATFORM_CHART_COLOR } from "../mock-data";
import type { PlatformKey } from "./PlatformSwitcher";

export function PlatformTrendChart({ platformKey }: { platformKey: PlatformKey }) {
  const [metric, setMetric] = useState<"spend" | "closing">("spend");
  const data = PLATFORM_TREND[platformKey];
  const color = PLATFORM_CHART_COLOR[platformKey];

  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Tren Performa</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMetric("spend")}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              metric === "spend" ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            Spend
          </button>
          <button
            type="button"
            onClick={() => setMetric("closing")}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              metric === "closing" ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            Closing
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9d9da6" }} axisLine={false} tickLine={false} />
          <Area type="monotone" dataKey={metric} stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2.4} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-2">
        <i className="inline-block size-2.5 rounded-sm" style={{ background: color }} />
        {PLATFORMS[platformKey].name}
      </div>
    </div>
  );
}
```

- [x] **Step 4: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformTrendChart
```
Expected: PASS, 2/2.

- [x] **Step 5: Write the failing test for `PlatformCampaignTable`**

Create `src/features/detail-platform/components/__tests__/PlatformCampaignTable.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { PlatformCampaignTable } from "../PlatformCampaignTable";

test("shows only campaigns for the given platform's channel", () => {
  render(<PlatformCampaignTable platformKey="tiktok" />);
  expect(screen.getByText("Back-to-School Promo")).toBeInTheDocument();
  expect(screen.getByText("Holiday Teaser Ads")).toBeInTheDocument();
  expect(screen.getByText("Product Launch Beta")).toBeInTheDocument();
  expect(screen.queryByText("Summer Sale 2025")).not.toBeInTheDocument();
});

test("shows an empty-state message when a platform has no campaigns", () => {
  render(<PlatformCampaignTable platformKey="meta" campaignsOverride={[]} />);
  expect(screen.getByText(/tidak menjalankan campaign/i)).toBeInTheDocument();
});
```

- [x] **Step 6: Run to verify failure, then implement `PlatformCampaignTable`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformCampaignTable
```
Expected: FAIL.

Create `src/features/detail-platform/components/PlatformCampaignTable.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import { CAMPAIGNS, STATUS_LABEL, formatRupiah, type Campaign } from "@/features/overview-dashboard/mock-data";
import { PLATFORMS } from "@/features/overview-dashboard/mock-data";
import type { PlatformKey } from "./PlatformSwitcher";

export function PlatformCampaignTable({
  platformKey,
  campaignsOverride,
}: {
  platformKey: PlatformKey;
  campaignsOverride?: Campaign[];
}) {
  const platformName = PLATFORMS[platformKey].name;
  const rows = campaignsOverride ?? CAMPAIGNS.filter((c) => c.channel === platformName);

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <h3 className="mb-3.5 text-sm font-bold">Campaign di platform ini</h3>
      {rows.length === 0 ? (
        <div className="py-5 text-center text-xs text-ink-3">
          {platformName} tidak menjalankan campaign — platform ini dipakai untuk tracking, bukan iklan.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Campaign</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Status</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Spend</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">CTR</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Closing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.name} className="border-b border-line-2 last:border-b-0">
                  <td className="px-2 py-3 text-xs">{c.name}</td>
                  <td className="px-2 py-3">
                    <Badge variant={c.status}>{STATUS_LABEL[c.status]}</Badge>
                  </td>
                  <td className="px-2 py-3 text-right text-xs">{formatRupiah(c.spend)}</td>
                  <td className="px-2 py-3 text-right text-xs">{c.ctr}</td>
                  <td className="px-2 py-3 text-right text-xs">{c.conv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 7: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformCampaignTable
```
Expected: PASS, 2/2.

- [x] **Step 8: Slot both into the Detail Platform page**

Modify `src/app/(dashboard)/detail/page.tsx`:
```tsx
import { PlatformTrendChart } from "@/features/detail-platform/components/PlatformTrendChart";
import { PlatformCampaignTable } from "@/features/detail-platform/components/PlatformCampaignTable";
// ...
      <PlatformKpiGrid platformKey={platform} />
      <PlatformTrendChart platformKey={platform} />
      <PlatformCampaignTable platformKey={platform} />
```

- [x] **Step 9: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

- [x] **Step 10: Manual checkpoint**

`npm run dev`, visit `/detail`. Confirm: platform chips switch between Meta Ads/TikTok Ads, KPI grid updates to 8 metrics for the selected platform, trend chart toggles Spend/Closing and its color matches the platform (amber for Meta, blue for TikTok), campaign table shows only that platform's campaigns.

---

## Self-Review Notes

**Spec coverage against `04-platform-detail-dashboard.md`:** platform switcher ✓, 8-metric KPI grid with deltas ✓, per-platform-type metric distinction (ads vs analytics) — **not applicable yet**, both current platforms (Meta, TikTok) are ads-type; this activates once Google Analytics is added to the catalog (deferred, see `PROGRESS.md`). Empty-state message for platforms with no campaigns ✓ (built and tested via `campaignsOverride`, even though neither current platform actually triggers it naturally). "Copy as report" button — **not built**, same `html2canvas` dependency gap as Overview's export, deferred.

**Cross-feature import decision:** `detail-platform` imports `PLATFORMS`/`CAMPAIGNS`/etc. directly from `overview-dashboard`'s `mock-data.ts` instead of a shared `src/lib/` module. This is a conscious shortcut for time, not an oversight — if a third feature needs the same data, that's the trigger to actually extract it to a shared location, not before (YAGNI).
