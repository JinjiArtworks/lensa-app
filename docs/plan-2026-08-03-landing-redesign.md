# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current bare-bones public landing page (`src/app/page.tsx`) with the richer, interactive design validated in the published Artifact (multi-KPI animated chart, animated hero mockup, FAQ, testimonials, billing toggle pricing), fully ported to the existing Next.js/TypeScript/Tailwind stack.

**Architecture:** One page (`src/app/page.tsx`) composed from ~13 small presentational components in `src/features/landing/components/`, all reading from a single extended `src/features/landing/mock-data.ts` + `src/features/landing/types.ts`. Motion (`framer-motion`) replaces the artifact's hand-rolled `IntersectionObserver`/rAF code; `recharts` (already used by `overview-dashboard`'s `TrendChart`/`ChannelChart`) replaces the artifact's hand-drawn SVG chart. The real `InsightCard` component (from `features/insight`) is reused as-is for the AI Insight spotlight — no duplicated markup.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS v3, `framer-motion` (already a dependency, currently unused), `recharts` (already used elsewhere), `lucide-react`, Vitest + Testing Library.

## Global Constraints

- Do **not** use `npx shadcn@latest` for any new UI primitive — it generates Tailwind v4-incompatible code. This plan does not need any new shadcn component (FAQ uses native `<details>`, matching the artifact).
- Color tokens: reuse existing CSS vars (`--accent`, `--accent-bg`, `--accent-text`, `--ink`, `--ink-2`, `--ink-3`, `--card`, `--bg`, `--line`, `--line-2`, `--green`, `--green-bg`, `--red`, `--red-bg`, `--gray`, `--gray-bg`) — these already equal the artifact's `--gold`/`--gold-bg`/`--gold-text` 1:1. One net-new token is added in Task 1 (`--accent-deep`, `#c98f00`, the artifact's `--gold-deep`) for hover/deep-gold states and chart strokes.
- Tailwind arbitrary/default scale gotcha: the v3 scale used in this project has no `4.5`/`6.5`/`7.5`/`15` key — don't introduce classes like `p-4.5`; stick to `0.5`/`1.5`/`2.5`/`3.5` or whole integers.
- `tsconfig.json` already has `"types": ["vitest/globals"]` — don't touch it; it's why `test`/`expect` work without imports.
- Every task must leave `tsc --noEmit`, `npm run test`, and `next build` green before moving to the next task.
- No dark mode work — this app has none anywhere, and the artifact was a deliberate light-only design matching it.
- New copy in this plan is already final (ported verbatim from the approved artifact) — don't paraphrase it further.

---

### Task 1: Design tokens + Bricolage Grotesque display font

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/page.tsx` (font import + wrapper class only, in this task)

**Interfaces:**
- Produces: CSS var `--accent-deep` (`#c98f00`); Tailwind color token `accent-deep`; Tailwind font family token `display` (resolves to the Bricolage Grotesque variable font); CSS var `--font-bricolage` scoped to the landing page's root wrapper `<div>`.

This task has no dedicated automated test — it's pure config/font wiring with no branching logic, the same treatment session 4 gave to the toast-system wiring ("dianggap cukup di-cover manual smoke test"; see `PROGRESS.md`). Verify with `tsc --noEmit` + a manual look at `/` in the browser at the end of the task.

- [ ] **Step 1: Add the `--accent-deep` token**

In `src/app/globals.css`, find the line `--accent-text: #8a6400;` inside `:root` and add directly after it:

```css
  --accent-deep: #c98f00;
```

- [ ] **Step 2: Register the token + a `display` font family in Tailwind**

In `tailwind.config.ts`, inside `colors`, find `"accent-text": "var(--accent-text)",` and add right after it:

```ts
        "accent-deep": "var(--accent-deep)",
```

Then, inside `theme.extend`, find the `fontFamily` block:

```ts
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
```

Replace it with:

```ts
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["var(--font-bricolage)", "ui-sans-serif", "sans-serif"],
      },
```

- [ ] **Step 3: Load Bricolage Grotesque via `next/font/google` in the landing page**

In `src/app/page.tsx`, add this import near the top (after the `Link`/icon imports):

```tsx
import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
});
```

Then find the component's root return:

```tsx
  return (
    <div>
```

and change it to apply the font variable to the wrapper:

```tsx
  return (
    <div className={bricolage.variable}>
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:3000/` (or the port Next.js prints), confirm the page still renders (headings still use Inter for now — `font-display` isn't applied to any element until Task 6+).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tailwind.config.ts src/app/page.tsx
git commit -m "feat(landing): add accent-deep token and Bricolage Grotesque display font"
```

---

### Task 2: `Reveal` scroll-in-view wrapper + IntersectionObserver test stub

**Files:**
- Create: `src/features/landing/components/Reveal.tsx`
- Test: `src/features/landing/components/__tests__/Reveal.test.tsx`
- Modify: `src/test/setup.ts`

**Interfaces:**
- Produces: `Reveal({ children, className? }: { children: ReactNode; className?: string })` — every later section component wraps its content in this instead of the artifact's manual `.reveal`/`IntersectionObserver` class toggling.

`framer-motion`'s `whileInView` relies on `IntersectionObserver`, which jsdom doesn't implement. Without a stub, mounting any `whileInView` component in a test either throws or silently never animates in an inconsistent way — add a minimal stub once, globally, rather than per-test-file.

- [ ] **Step 1: Add the IntersectionObserver stub to the global test setup**

Read `src/test/setup.ts` first (currently just one import line), then replace its entire contents with:

```ts
import "@testing-library/jest-dom/vitest";

class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver;
```

- [ ] **Step 2: Write the failing test**

Create `src/features/landing/components/__tests__/Reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Reveal } from "../Reveal";

test("renders its children", () => {
  render(
    <Reveal>
      <p>Konten yang di-reveal</p>
    </Reveal>
  );
  expect(screen.getByText("Konten yang di-reveal")).toBeInTheDocument();
});

test("forwards a custom className to the wrapper", () => {
  render(
    <Reveal className="test-marker">
      <span>x</span>
    </Reveal>
  );
  expect(screen.getByText("x").parentElement).toHaveClass("test-marker");
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/Reveal.test.tsx`
Expected: FAIL — `Cannot find module '../Reveal'`.

- [ ] **Step 4: Implement `Reveal`**

Create `src/features/landing/components/Reveal.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/Reveal.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/test/setup.ts src/features/landing/components/Reveal.tsx src/features/landing/components/__tests__/Reveal.test.tsx
git commit -m "feat(landing): add Reveal scroll-in-view wrapper + IntersectionObserver test stub"
```

---

### Task 3: Extend landing types + mock data

**Files:**
- Create: `src/features/landing/types.ts`
- Modify: `src/features/landing/mock-data.ts`
- Test: `src/features/landing/__tests__/mock-data.test.ts`

**Interfaces:**
- Produces (from `types.ts`): `LandingFeature`, `HowItWorksStep`, `Testimonial`, `PricingRow`, `FaqItem`, `HeroPlatformKey` (`"meta" | "tiktok"`), `HeroPlatformData`, `TrendMetricKey` (`"roas" | "cpa" | "ctr" | "closing"`), `TrendMetric`, `TrendPoint`.
- Produces (from `mock-data.ts`, in addition to the existing `FEATURES`/`FREE_FEATURES`/`PRO_FEATURES` — `FREE_FEATURES`/`PRO_FEATURES` are removed in this task, replaced by `PRICING_ROWS`): `HOW_IT_WORKS_STEPS`, `TESTIMONIALS`, `PRICING_ROWS`, `FAQ_ITEMS`, `HERO_PLATFORM_DATA`, `TREND_METRICS`.

- [ ] **Step 1: Write the failing data-integrity test**

Create `src/features/landing/__tests__/mock-data.test.ts`:

```ts
import {
  FEATURES,
  HOW_IT_WORKS_STEPS,
  TESTIMONIALS,
  PRICING_ROWS,
  FAQ_ITEMS,
  HERO_PLATFORM_DATA,
  TREND_METRICS,
} from "../mock-data";

test("FEATURES has 4 items, each with a non-empty proof line", () => {
  expect(FEATURES).toHaveLength(4);
  FEATURES.forEach((f) => expect(f.proof.length).toBeGreaterThan(0));
});

test("HOW_IT_WORKS_STEPS has exactly 3 steps", () => {
  expect(HOW_IT_WORKS_STEPS).toHaveLength(3);
});

test("TESTIMONIALS has 3 items, each with a stat line", () => {
  expect(TESTIMONIALS).toHaveLength(3);
  TESTIMONIALS.forEach((t) => expect(t.stat.length).toBeGreaterThan(0));
});

test("PRICING_ROWS has 5 comparison rows with both free and pro values", () => {
  expect(PRICING_ROWS).toHaveLength(5);
  PRICING_ROWS.forEach((row) => {
    expect(row.free.length).toBeGreaterThan(0);
    expect(row.pro.length).toBeGreaterThan(0);
  });
});

test("FAQ_ITEMS has 6 question/answer pairs", () => {
  expect(FAQ_ITEMS).toHaveLength(6);
  FAQ_ITEMS.forEach((item) => {
    expect(item.question.length).toBeGreaterThan(0);
    expect(item.answer.length).toBeGreaterThan(0);
  });
});

test("HERO_PLATFORM_DATA has both meta and tiktok entries", () => {
  expect(HERO_PLATFORM_DATA.meta).toBeDefined();
  expect(HERO_PLATFORM_DATA.tiktok).toBeDefined();
});

test("every TREND_METRICS series has exactly 12 weekly points", () => {
  (["roas", "cpa", "ctr", "closing"] as const).forEach((key) => {
    expect(TREND_METRICS[key].data).toHaveLength(12);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/__tests__/mock-data.test.ts`
Expected: FAIL — the new exports don't exist yet.

- [ ] **Step 3: Create `src/features/landing/types.ts`**

```ts
import type { LucideIcon } from "lucide-react";

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
  proof: string;
}

export interface HowItWorksStep {
  title: string;
  desc: string;
}

export interface Testimonial {
  quote: string;
  stat: string;
  name: string;
  business: string;
  avatarInitial: string;
}

export interface PricingRow {
  label: string;
  free: string;
  pro: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type HeroPlatformKey = "meta" | "tiktok";

export interface HeroPlatformData {
  spendValue: number;
  spendDelta: string;
  spendUp: boolean;
  roasValue: number;
  roasDelta: string;
  roasUp: boolean;
  bars: number[];
  insight: string;
}

export type TrendMetricKey = "roas" | "cpa" | "ctr" | "closing";

export interface TrendPoint {
  week: number;
  value: number;
}

export interface TrendMetric {
  tabLabel: string;
  label: string;
  legend: string;
  goodDirection: "up" | "down";
  data: TrendPoint[];
  format: (value: number) => string;
}
```

- [ ] **Step 4: Extend `src/features/landing/mock-data.ts`**

Read the current file first (it has `FEATURES`, `FREE_FEATURES`, `PRO_FEATURES`). Replace its entire contents with:

```ts
import { LayoutDashboard, Sparkles, Share2, RefreshCw } from "lucide-react";
import type {
  LandingFeature,
  HowItWorksStep,
  Testimonial,
  PricingRow,
  FaqItem,
  HeroPlatformKey,
  HeroPlatformData,
  TrendMetricKey,
  TrendMetric,
} from "./types";

export const FEATURES: LandingFeature[] = [
  {
    icon: LayoutDashboard,
    title: "Satu Dashboard, Semua Platform",
    desc: "Meta Ads dan TikTok Ads digabung jadi satu tampilan yang jernih, jadi kamu nggak perlu bolak-balik antar ads manager.",
    proof: "2 platform, 1 login",
  },
  {
    icon: Sparkles,
    title: "AI Insight yang Mudah Dipahami",
    desc: "Rekomendasi ditulis dengan bahasa yang gampang dimengerti pemilik bisnis — bukan istilah teknis yang bikin bingung.",
    proof: "Update tiap hari",
  },
  {
    icon: Share2,
    title: "Copy as Report Sekali Klik",
    desc: "Ringkas performa iklan jadi laporan yang rapi dan siap dikirim ke tim atau partner bisnis.",
    proof: "Siap kirim dalam hitungan detik",
  },
  {
    icon: RefreshCw,
    title: "Sync Real-Time",
    desc: "Klik Sync, dan seluruh data dari platform yang terhubung langsung diperbarui — kamu selalu lihat angka paling baru.",
    proof: "~2 menit per sync",
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Hubungkan akun iklanmu",
    desc: "Sambungkan Meta Ads dan TikTok Ads dalam kurang dari 2 menit, tanpa perlu bantuan developer.",
  },
  {
    title: "Lensa satukan datanya",
    desc: "Setiap metrik ditarik otomatis dan digabung secara real-time, jadi kamu nggak perlu rekap manual lagi.",
  },
  {
    title: "Dapat rekomendasi yang jelas",
    desc: "AI Insight merangkum apa yang berubah dan apa yang sebaiknya kamu lakukan — bukan cuma angka mentah.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Dulu tiap pagi saya buka dua ads manager plus spreadsheet cuma buat tau performa kemarin gimana. Sekarang lima menit di Lensa, saya udah tau mana yang harus segera saya benerin.",
    stat: "+18% closing dalam 2 minggu pertama",
    name: "Sinta",
    business: "Toko Baju Sinta · Fashion",
    avatarInitial: "S",
  },
  {
    quote:
      "AI Insight-nya kerasa kayak dikasih saran sama orang yang ngerti bisnis saya — bukan cuma angka. Realokasi budget yang disaranin beneran naikin closing kita bulan itu juga.",
    stat: "+22% ROAS di bulan pertama",
    name: "Pak Budi",
    business: "Dapur Bu Retno · F&B",
    avatarInitial: "B",
  },
  {
    quote:
      "Tim saya cuma berdua, gantian pegang iklan. Copy as Report bikin serah terima ke partner jadi rapi tanpa perlu meeting panjang tiap minggu.",
    stat: "~3 jam/minggu dihemat dari rekap manual",
    name: "Nadia",
    business: "Glowlab Skincare",
    avatarInitial: "N",
  },
];

export const PRICING_ROWS: PricingRow[] = [
  { label: "Jumlah bisnis", free: "1 bisnis", pro: "Unlimited" },
  { label: "Platform terhubung", free: "1 platform (Meta atau TikTok)", pro: "Meta + TikTok otomatis" },
  { label: "AI Insight", free: "Dasar (kategori Positif)", pro: "Penuh + export laporan" },
  { label: "Anggota tim", free: "1 pengguna", pro: "Undang tim (Admin/Viewer)" },
  { label: "Histori data", free: "7 hari", pro: "Tanpa batas" },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apakah data toko saya aman?",
    answer:
      "Aman. Lensa hanya membaca data performa lewat akses resmi API Meta dan TikTok — bukan password akun kamu. Akses ini bisa kamu cabut kapan saja lewat pengaturan.",
  },
  {
    question: "Apakah proses connect akun Meta/TikTok Ads ribet?",
    answer:
      'Nggak. Dari halaman Connect Platform, klik "Hubungkan" lalu login lewat halaman resmi Meta/TikTok. Prosesnya sekitar 2 menit, tanpa bantuan developer.',
  },
  {
    question: "Paket Free-nya beneran gratis selamanya?",
    answer:
      "Betul. Free bisa kamu pakai selama yang kamu mau, untuk 1 bisnis dan 1 platform. Nggak ada trial otomatis yang tiba-tiba menagih kartu kamu.",
  },
  {
    question: "Bagaimana kalau saya beriklan di platform selain Meta/TikTok?",
    answer:
      "Saat ini Lensa fokus dulu di Meta Ads dan TikTok Ads, karena ini kombinasi yang paling umum dipakai bisnis kecil-menengah di Indonesia. Platform lain ada di rencana pengembangan berikutnya.",
  },
  {
    question: "Bisa upgrade atau downgrade kapan saja?",
    answer:
      "Bisa. Upgrade ke Pro langsung aktif saat itu juga, sedangkan downgrade ke Free berlaku di periode tagihan berikutnya, tanpa penalti.",
  },
  {
    question: "Apakah saya perlu kartu kredit buat mencoba?",
    answer: "Nggak perlu. Paket Free bisa langsung kamu pakai tanpa kartu kredit sama sekali.",
  },
];

export const HERO_PLATFORM_DATA: Record<HeroPlatformKey, HeroPlatformData> = {
  meta: {
    spendValue: 2.4,
    spendDelta: "▲ 8% vs minggu lalu",
    spendUp: true,
    roasValue: 2.9,
    roasDelta: "▲ 5% vs minggu lalu",
    roasUp: true,
    bars: [55, 62, 58, 70, 66, 82, 90],
    insight: "Spend naik 8%, closing ikut naik 12% — performa masih sehat.",
  },
  tiktok: {
    spendValue: 1.6,
    spendDelta: "▲ 32% vs minggu lalu",
    spendUp: true,
    roasValue: 2.3,
    roasDelta: "▼ 3% vs minggu lalu",
    roasUp: false,
    bars: [40, 44, 40, 46, 42, 41, 43],
    insight: "Spend naik 32%, closing masih stagnan — worth dicek targeting.",
  },
};

function weeklyPoints(values: number[]) {
  return values.map((value, i) => ({ week: i + 1, value }));
}

export const TREND_METRICS: Record<TrendMetricKey, TrendMetric> = {
  roas: {
    tabLabel: "ROAS",
    label: "ROAS rata-rata mingguan",
    legend: "ROAS mingguan (kelipatan)",
    goodDirection: "up",
    data: weeklyPoints([2.1, 2.18, 2.25, 2.3, 2.38, 2.45, 2.52, 2.58, 2.65, 2.72, 2.8, 2.9]),
    format: (v) => v.toFixed(1).replace(".", ",") + "x",
  },
  cpa: {
    tabLabel: "CPA",
    label: "CPA rata-rata mingguan",
    legend: "CPA mingguan (Rp ribu)",
    goodDirection: "down",
    data: weeklyPoints([82, 79, 76, 74, 71, 69, 66, 64, 62, 60, 58, 56]),
    format: (v) => "Rp" + Math.round(v) + "rb",
  },
  ctr: {
    tabLabel: "CTR",
    label: "CTR rata-rata mingguan",
    legend: "CTR mingguan (%)",
    goodDirection: "up",
    data: weeklyPoints([2.6, 2.7, 2.8, 2.85, 2.95, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6]),
    format: (v) => v.toFixed(1) + "%",
  },
  closing: {
    tabLabel: "Closing",
    label: "Closing rata-rata mingguan",
    legend: "Closing mingguan (jumlah)",
    goodDirection: "up",
    data: weeklyPoints([24, 25, 27, 28, 30, 31, 33, 34, 36, 37, 39, 40]),
    format: (v) => Math.round(v) + " closing",
  },
};
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run src/features/landing/__tests__/mock-data.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/landing/types.ts src/features/landing/mock-data.ts src/features/landing/__tests__/mock-data.test.ts
git commit -m "feat(landing): add types and mock data for the redesigned landing page"
```

---

### Task 4: `computeTrendDelta` pure helper

**Files:**
- Create: `src/features/landing/lib/trend.ts`
- Test: `src/features/landing/lib/__tests__/trend.test.ts`

**Interfaces:**
- Consumes: `TrendMetric` (from Task 3's `types.ts`).
- Produces: `computeTrendDelta(metric: TrendMetric): { deltaPct: number; wentUp: boolean; isGood: boolean; first: number; last: number }` — used by Task 13 (`TrendChartSection`).

- [ ] **Step 1: Write the failing tests**

Create `src/features/landing/lib/__tests__/trend.test.ts`:

```ts
import { computeTrendDelta } from "../trend";
import { TREND_METRICS } from "../../mock-data";

test("computeTrendDelta marks a rising higher-is-better metric (ROAS) as good", () => {
  const result = computeTrendDelta(TREND_METRICS.roas);
  expect(result.wentUp).toBe(true);
  expect(result.isGood).toBe(true);
  expect(result.deltaPct).toBeGreaterThan(0);
});

test("computeTrendDelta marks a falling lower-is-better metric (CPA) as good", () => {
  const result = computeTrendDelta(TREND_METRICS.cpa);
  expect(result.wentUp).toBe(false);
  expect(result.isGood).toBe(true);
});

test("computeTrendDelta derives deltaPct from the actual first/last data points", () => {
  const result = computeTrendDelta(TREND_METRICS.closing);
  const first = TREND_METRICS.closing.data[0].value;
  const last = TREND_METRICS.closing.data[TREND_METRICS.closing.data.length - 1].value;
  expect(result.first).toBe(first);
  expect(result.last).toBe(last);
  expect(result.deltaPct).toBe(Math.round((Math.abs(last - first) / first) * 100));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/lib/__tests__/trend.test.ts`
Expected: FAIL — `Cannot find module '../trend'`.

- [ ] **Step 3: Implement `computeTrendDelta`**

Create `src/features/landing/lib/trend.ts`:

```ts
import type { TrendMetric } from "../types";

export function computeTrendDelta(metric: TrendMetric) {
  const first = metric.data[0].value;
  const last = metric.data[metric.data.length - 1].value;
  const deltaPct = Math.round((Math.abs(last - first) / first) * 100);
  const wentUp = last > first;
  const isGood = (metric.goodDirection === "up") === wentUp;
  return { deltaPct, wentUp, isGood, first, last };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/lib/__tests__/trend.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/lib/trend.ts src/features/landing/lib/__tests__/trend.test.ts
git commit -m "feat(landing): add computeTrendDelta pure helper"
```

---

### Task 5: `Nav` component

**Files:**
- Create: `src/features/landing/components/Nav.tsx`
- Test: `src/features/landing/components/__tests__/Nav.test.tsx`

**Interfaces:**
- Produces: `Nav()` — no props, self-contained (owns its own mobile-menu open state). Consumed by Task 14 (`page.tsx` assembly).

This ports the already-audited header from the current `page.tsx` (Task 1 in the prior landing-page audit fixed the `Button`/`Link` nesting and `aria-expanded` here — carry those fixes forward) into its own file, and adds a "Cara Kerja" and "FAQ" nav link to match the expanded page.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/Nav.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Nav } from "../Nav";

test("renders the brand and all 4 nav links", () => {
  render(<Nav />);
  expect(screen.getByText("Lensa")).toBeInTheDocument();
  ["Fitur", "Cara Kerja", "Harga", "FAQ"].forEach((label) => {
    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
  });
});

test("mobile menu toggle flips aria-expanded and reveals links", () => {
  render(<Nav />);
  const toggle = screen.getByLabelText("Buka menu");
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
});

test("primary CTAs link to /sign-in", () => {
  render(<Nav />);
  const ctas = screen.getAllByRole("link", { name: "Coba Gratis" });
  ctas.forEach((cta) => expect(cta).toHaveAttribute("href", "/sign-in"));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/Nav.test.tsx`
Expected: FAIL — `Cannot find module '../Nav'`.

- [ ] **Step 3: Implement `Nav`**

Create `src/features/landing/components/Nav.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-sm font-extrabold text-ink">
            L
          </div>
          <span className="font-display text-[15px] font-extrabold tracking-tight">Lensa</span>
        </div>

        <nav className="hidden items-center gap-6 text-[13px] font-semibold text-ink-2 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-in">Coba Gratis</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex size-9 items-center justify-center rounded-lg border border-line md:hidden"
          aria-label="Buka menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-line px-5 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2 text-[13px] font-semibold text-ink-2"
            >
              {link.label}
            </a>
          ))}
          <Link href="/sign-in" className="rounded-lg px-2 py-2 text-[13px] font-semibold text-ink-2">
            Masuk
          </Link>
          <Button className="mt-1 w-full justify-center" asChild>
            <Link href="/sign-in">Coba Gratis</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/Nav.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/Nav.tsx src/features/landing/components/__tests__/Nav.test.tsx
git commit -m "feat(landing): extract Nav component with Cara Kerja + FAQ links"
```

---

### Task 6: `HeroMockup` component (interactive Meta/TikTok dashboard preview)

**Files:**
- Create: `src/features/landing/components/HeroMockup.tsx`
- Test: `src/features/landing/components/__tests__/HeroMockup.test.tsx`

**Interfaces:**
- Consumes: `HERO_PLATFORM_DATA` (Task 3).
- Produces: `HeroMockup()` — no props. Consumed by Task 7 (`Hero`).

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/HeroMockup.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HeroMockup } from "../HeroMockup";

test("defaults to Meta Ads tab with Meta's spend/ROAS values", async () => {
  render(<HeroMockup />);
  expect(screen.getByRole("tab", { name: "Meta Ads" })).toHaveAttribute("aria-selected", "true");
  await waitFor(() => expect(screen.getByText("Rp2,4jt")).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText("2,9x")).toBeInTheDocument());
});

test("clicking TikTok Ads tab switches values and insight text", async () => {
  render(<HeroMockup />);
  fireEvent.click(screen.getByRole("tab", { name: "TikTok Ads" }));
  expect(screen.getByRole("tab", { name: "TikTok Ads" })).toHaveAttribute("aria-selected", "true");
  await waitFor(() => expect(screen.getByText("Rp1,6jt")).toBeInTheDocument());
  await waitFor(() =>
    expect(screen.getByText("Spend naik 32%, closing masih stagnan — worth dicek targeting.")).toBeInTheDocument()
  );
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/HeroMockup.test.tsx`
Expected: FAIL — `Cannot find module '../HeroMockup'`.

- [ ] **Step 3: Implement `HeroMockup`**

Create `src/features/landing/components/HeroMockup.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { animate } from "framer-motion";
import { HERO_PLATFORM_DATA } from "../mock-data";
import type { HeroPlatformKey } from "../types";

const TABS: { key: HeroPlatformKey; label: string }[] = [
  { key: "meta", label: "Meta Ads" },
  { key: "tiktok", label: "TikTok Ads" },
];

function formatSpend(v: number) {
  return "Rp" + v.toFixed(1).replace(".", ",") + "jt";
}
function formatRoas(v: number) {
  return v.toFixed(1).replace(".", ",") + "x";
}

export function HeroMockup() {
  const [platform, setPlatform] = useState<HeroPlatformKey>("meta");
  const data = HERO_PLATFORM_DATA[platform];

  // Raw numeric refs (not the formatted display strings) are what each new
  // animate() call tweens from, so switching tabs mid-animation is always
  // based on an exact number, never a re-parsed display string.
  const spendRef = useRef(data.spendValue);
  const roasRef = useRef(data.roasValue);
  const [spendText, setSpendText] = useState(formatSpend(data.spendValue));
  const [roasText, setRoasText] = useState(formatRoas(data.roasValue));

  function handlePlatformChange(next: HeroPlatformKey) {
    setPlatform(next);
    const nextData = HERO_PLATFORM_DATA[next];
    animate(spendRef.current, nextData.spendValue, {
      duration: 0.5,
      onUpdate: (v) => {
        spendRef.current = v;
        setSpendText(formatSpend(v));
      },
    });
    animate(roasRef.current, nextData.roasValue, {
      duration: 0.5,
      onUpdate: (v) => {
        roasRef.current = v;
        setRoasText(formatRoas(v));
      },
    });
  }

  const maxBar = Math.max(...data.bars);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-x-5 -inset-y-14 z-0 blur-md"
        style={{
          background:
            "radial-gradient(closest-side, rgba(240,180,0,.30), transparent 70%) 30% 35% / 65% 65% no-repeat, radial-gradient(closest-side, rgba(240,180,0,.20), transparent 72%) 70% 60% / 60% 60% no-repeat",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 rounded-[26px] border border-line bg-card p-5 shadow-[0_30px_70px_-30px_rgba(22,22,26,.32),0_10px_30px_-14px_rgba(240,180,0,.22)]">
        <div className="mb-3.5 flex items-center justify-between gap-2.5">
          <span className="text-[10.5px] font-bold tracking-wide text-ink-3">DASHBOARD · TOKO BAJU SINTA</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-green-bg px-1.5 py-0.5 text-[9.5px] font-extrabold text-green">
            <span className="size-1.5 rounded-full bg-green" />
            LIVE
          </span>
        </div>

        <div className="mb-4 flex gap-1.5 rounded-[10px] bg-gray-bg p-1" role="tablist" aria-label="Pilih platform contoh">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={platform === tab.key}
              onClick={() => handlePlatformChange(tab.key)}
              className={`flex-1 rounded-lg py-2 text-[12.5px] font-bold transition-colors ${
                platform === tab.key ? "bg-card text-ink shadow-sm" : "text-ink-2"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-[10px] border border-line-2 bg-bg p-3">
            <span className="block text-[10px] font-bold tracking-wide text-ink-3">TOTAL SPEND</span>
            <span className="mt-1 block font-display text-xl font-bold tabular-nums">{spendText}</span>
            <span className={`mt-0.5 block text-[10.5px] font-bold ${data.spendUp ? "text-green" : "text-red"}`}>
              {data.spendDelta}
            </span>
          </div>
          <div className="rounded-[10px] border border-line-2 bg-bg p-3">
            <span className="block text-[10px] font-bold tracking-wide text-ink-3">ROAS</span>
            <span className="mt-1 block font-display text-xl font-bold tabular-nums">{roasText}</span>
            <span className={`mt-0.5 block text-[10.5px] font-bold ${data.roasUp ? "text-green" : "text-red"}`}>
              {data.roasDelta}
            </span>
          </div>
        </div>

        <div className="mb-3 flex h-[74px] items-end gap-1.5 rounded-[10px] border border-line-2 bg-bg p-3" aria-hidden="true">
          {data.bars.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[3px] bg-accent transition-[height] duration-300"
              style={{ height: `${(v / maxBar) * 64}px` }}
            />
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-[10px] border border-accent bg-accent-bg p-2.5 text-[11.5px] font-semibold leading-relaxed text-accent-text">
          {data.insight}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/HeroMockup.test.tsx`
Expected: PASS (2 tests). (The `waitFor` calls accommodate the `framer-motion` `animate()` tween settling — jsdom's `requestAnimationFrame` runs synchronously enough within a microtask flush, but `waitFor` makes the test robust either way.)

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/HeroMockup.tsx src/features/landing/components/__tests__/HeroMockup.test.tsx
git commit -m "feat(landing): add interactive HeroMockup with animated KPI values"
```

---

### Task 7: `Hero` component

**Files:**
- Create: `src/features/landing/components/Hero.tsx`
- Test: `src/features/landing/components/__tests__/Hero.test.tsx`

**Interfaces:**
- Consumes: `HeroMockup` (Task 6).
- Produces: `Hero()` — no props. Consumed by Task 14.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/Hero.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Hero } from "../Hero";

test("renders the headline and both CTAs", () => {
  render(<Hero />);
  expect(screen.getByText(/Semua performa iklanmu/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Mulai Gratis" })).toHaveAttribute("href", "/sign-in");
  expect(screen.getByRole("link", { name: "Lihat Cara Kerjanya" })).toHaveAttribute("href", "#cara-kerja");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/Hero.test.tsx`
Expected: FAIL — `Cannot find module '../Hero'`.

- [ ] **Step 3: Implement `Hero`**

Create `src/features/landing/components/Hero.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroMockup } from "./HeroMockup";

export function Hero() {
  return (
    <section className="overflow-hidden py-16 md:py-24">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-14 px-5 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-accent-text before:h-px before:w-3.5 before:bg-accent">
            Buat pemilik bisnis yang jualan di lebih dari satu platform
          </span>
          <h1 className="mt-4 font-display text-[34px] font-bold leading-[1.06] tracking-tight md:text-[52px]">
            Semua performa iklanmu, dalam satu tampilan yang <span className="text-accent-deep">jernih</span>.
          </h1>
          <p className="mt-5 max-w-[460px] text-[16.5px] leading-relaxed text-ink-2">
            Lensa menyatukan Meta Ads dan TikTok Ads dalam satu dashboard, lengkap dengan AI Insight yang menerjemahkan
            datanya jadi langkah bisnis yang jelas — bukan istilah teknis yang bikin pusing.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-in">Mulai Gratis</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <a href="#cara-kerja">Lihat Cara Kerjanya</a>
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3.5 text-xs font-semibold text-ink-3">
            <span>Gratis untuk 1 bisnis</span>
            <span>Tanpa kartu kredit</span>
            <span>Aktif dalam 5 menit</span>
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/Hero.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/Hero.tsx src/features/landing/components/__tests__/Hero.test.tsx
git commit -m "feat(landing): add Hero section"
```

---

### Task 8: `ProblemSection` component

**Files:**
- Create: `src/features/landing/components/ProblemSection.tsx`
- Test: `src/features/landing/components/__tests__/ProblemSection.test.tsx`

**Interfaces:**
- Consumes: `Reveal` (Task 2).
- Produces: `ProblemSection()` — no props. Consumed by Task 14.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/ProblemSection.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ProblemSection } from "../ProblemSection";

test("renders the headline and all 4 scattered-tool labels plus the focus card", () => {
  render(<ProblemSection />);
  expect(screen.getByText(/Empat tab kebuka bersamaan/)).toBeInTheDocument();
  ["Meta Ads Manager", "TikTok Ads Manager", "Spreadsheet Manual", "Grup WhatsApp Tim"].forEach((label) => {
    expect(screen.getByText(label)).toBeInTheDocument();
  });
  expect(screen.getByText("Dashboard Lensa")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/ProblemSection.test.tsx`
Expected: FAIL — `Cannot find module '../ProblemSection'`.

- [ ] **Step 3: Implement `ProblemSection`**

Create `src/features/landing/components/ProblemSection.tsx`:

```tsx
import { Reveal } from "./Reveal";

const CHAOS_CARDS = [
  { label: "Meta Ads Manager", sub: "Tab 1 dari 4", rotate: "-rotate-[7deg]", offset: "left-0 top-1" },
  { label: "TikTok Ads Manager", sub: "Tab 2 dari 4", rotate: "rotate-[5deg]", offset: "left-[130px] top-[30px]" },
  { label: "Spreadsheet Manual", sub: "Tab 3 dari 4", rotate: "rotate-[4deg]", offset: "left-[10px] top-[120px]" },
  { label: "Grup WhatsApp Tim", sub: "Tab 4 dari 4", rotate: "-rotate-[4deg]", offset: "left-[150px] top-[150px]" },
];

export function ProblemSection() {
  return (
    <section className="border-y border-line bg-card py-[92px]">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 px-5 md:grid-cols-2">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-accent-text before:h-px before:w-3.5 before:bg-accent">
            Masalah yang sering dialami pemilik bisnis
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold leading-tight tracking-tight md:text-[36px]">
            Empat tab kebuka bersamaan, tapi satu pertanyaan sederhana ini masih belum terjawab: iklan kita untung atau
            nggak?
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Meta Ads Manager buat cek spend. TikTok Ads Manager buat cek closing. Spreadsheet buat rekap manual. Grup
            WhatsApp buat mastiin datanya masih akurat. Bukan karena kamu nggak niat ngurus — cuma belum ada satu
            tempat buat lihat semuanya sekaligus.
          </p>
        </Reveal>

        <Reveal className="relative mx-auto h-[340px] max-w-[460px] md:h-[300px] md:max-w-none">
          {CHAOS_CARDS.map((card) => (
            <div
              key={card.label}
              className={`absolute w-[168px] rounded-[10px] border border-line bg-gray-bg p-3 opacity-80 grayscale ${card.rotate} ${card.offset}`}
            >
              <div className="mb-2 size-5 rounded-md bg-gray" />
              <div className="text-[11px] font-bold text-ink-2">{card.label}</div>
              <div className="mt-0.5 text-[9.5px] text-ink-3">{card.sub}</div>
            </div>
          ))}
          <div className="absolute left-[300px] top-[130px] hidden opacity-50 md:block" aria-hidden="true">
            <svg width="46" height="20" viewBox="0 0 46 20" fill="none" stroke="#c98f00" strokeWidth={2} strokeLinecap="round">
              <path d="M0 10h38M30 3l8 7-8 7" />
            </svg>
          </div>
          <div className="absolute left-[330px] top-10 hidden w-[190px] rounded-2xl border-[1.5px] border-accent bg-card p-4 shadow-[0_30px_70px_-30px_rgba(22,22,26,.32),0_10px_30px_-14px_rgba(240,180,0,.22)] md:block">
            <svg width="26" height="17" viewBox="0 0 30 20" className="mb-2.5">
              <circle cx="11" cy="10" r="8.5" fill="none" stroke="#f0b400" strokeWidth={2} />
              <circle cx="19" cy="10" r="8.5" fill="#f0b400" fillOpacity={0.18} stroke="#f0b400" strokeWidth={2} />
            </svg>
            <div className="text-[12.5px] font-bold">Dashboard Lensa</div>
            <div className="mt-1 text-[11px] leading-snug text-ink-2">Satu tampilan. Satu jawaban jelas.</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/ProblemSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/ProblemSection.tsx src/features/landing/components/__tests__/ProblemSection.test.tsx
git commit -m "feat(landing): add ProblemSection with scattered-tools visual"
```

---

### Task 9: `HowItWorks` component

**Files:**
- Create: `src/features/landing/components/HowItWorks.tsx`
- Test: `src/features/landing/components/__tests__/HowItWorks.test.tsx`

**Interfaces:**
- Consumes: `HOW_IT_WORKS_STEPS` (Task 3), `Reveal` (Task 2).
- Produces: `HowItWorks()` — no props. Consumed by Task 14.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/HowItWorks.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { HowItWorks } from "../HowItWorks";
import { HOW_IT_WORKS_STEPS } from "../../mock-data";

test("renders all 3 steps, numbered 1 to 3", () => {
  render(<HowItWorks />);
  HOW_IT_WORKS_STEPS.forEach((step) => {
    expect(screen.getByText(step.title)).toBeInTheDocument();
  });
  ["1", "2", "3"].forEach((n) => expect(screen.getByText(n)).toBeInTheDocument());
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/HowItWorks.test.tsx`
Expected: FAIL — `Cannot find module '../HowItWorks'`.

- [ ] **Step 3: Implement `HowItWorks`**

Create `src/features/landing/components/HowItWorks.tsx`:

```tsx
import { Reveal } from "./Reveal";
import { HOW_IT_WORKS_STEPS } from "../mock-data";

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">Cara Kerja</span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Dari akun yang terpisah, jadi satu alur yang jelas — cuma 3 langkah.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <Reveal key={step.title}>
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-ink font-display text-base font-bold text-accent">
                {i + 1}
              </div>
              <div className="text-[16.5px] font-bold">{step.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/HowItWorks.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/HowItWorks.tsx src/features/landing/components/__tests__/HowItWorks.test.tsx
git commit -m "feat(landing): add HowItWorks 3-step section"
```

---

### Task 10: `FeaturesGrid` component

**Files:**
- Create: `src/features/landing/components/FeaturesGrid.tsx`
- Test: `src/features/landing/components/__tests__/FeaturesGrid.test.tsx`

**Interfaces:**
- Consumes: `FEATURES` (Task 3), `Reveal` (Task 2).
- Produces: `FeaturesGrid()` — no props. Consumed by Task 14.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/FeaturesGrid.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { FeaturesGrid } from "../FeaturesGrid";
import { FEATURES } from "../../mock-data";

test("renders all 4 features with their proof line", () => {
  render(<FeaturesGrid />);
  FEATURES.forEach((f) => {
    expect(screen.getByText(f.title)).toBeInTheDocument();
    expect(screen.getByText(f.proof)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/FeaturesGrid.test.tsx`
Expected: FAIL — `Cannot find module '../FeaturesGrid'`.

- [ ] **Step 3: Implement `FeaturesGrid`**

Create `src/features/landing/components/FeaturesGrid.tsx`:

```tsx
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { FEATURES } from "../mock-data";

export function FeaturesGrid() {
  return (
    <section id="fitur" className="scroll-mt-20 border-y border-line bg-card py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">Fitur Utama</span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Dirancang buat pemilik bisnis, bukan buat analis data.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Setiap fitur dibuat biar kamu bisa ambil keputusan lebih cepat — tanpa perlu belajar istilah marketing
            dulu.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Reveal
              key={f.title}
              className="rounded-2xl border border-line bg-bg p-6 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
            >
              <div className="mb-4 inline-flex size-[42px] items-center justify-center rounded-xl bg-accent-bg text-accent-text">
                <f.icon className="size-5" />
              </div>
              <div className="text-[15.5px] font-bold">{f.title}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{f.desc}</p>
              <div className="mt-3.5 flex w-full items-center gap-1.5 border-t border-line-2 pt-3 text-[11px] font-bold text-ink-3">
                <Check className="size-3 text-accent-deep" />
                {f.proof}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/FeaturesGrid.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/FeaturesGrid.tsx src/features/landing/components/__tests__/FeaturesGrid.test.tsx
git commit -m "feat(landing): add FeaturesGrid with proof lines"
```

---

### Task 11: `FaqSection` component

**Files:**
- Create: `src/features/landing/components/FaqSection.tsx`
- Test: `src/features/landing/components/__tests__/FaqSection.test.tsx`

**Interfaces:**
- Consumes: `FAQ_ITEMS` (Task 3), `Reveal` (Task 2).
- Produces: `FaqSection()` — no props. Consumed by Task 14. Placed structurally in the middle of the page (between Features and the AI Insight spotlight), per the earlier reposition request.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/FaqSection.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { FaqSection } from "../FaqSection";
import { FAQ_ITEMS } from "../../mock-data";

test("renders all 6 questions, collapsed by default", () => {
  render(<FaqSection />);
  FAQ_ITEMS.forEach((item) => {
    const details = screen.getByText(item.question).closest("details");
    expect(details).not.toHaveAttribute("open");
  });
});

test("clicking a question expands it and shows the answer", () => {
  render(<FaqSection />);
  const first = FAQ_ITEMS[0];
  fireEvent.click(screen.getByText(first.question));
  const details = screen.getByText(first.question).closest("details");
  expect(details).toHaveAttribute("open");
  expect(screen.getByText(first.answer)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/FaqSection.test.tsx`
Expected: FAIL — `Cannot find module '../FaqSection'`.

- [ ] **Step 3: Implement `FaqSection`**

Create `src/features/landing/components/FaqSection.tsx`:

```tsx
import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";
import { FAQ_ITEMS } from "../mock-data";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-y border-line bg-card py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Pertanyaan yang Sering Ditanyakan
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Masih ada yang mengganjal? Ini beberapa jawabannya.
          </h2>
        </Reveal>
        <Reveal className="mx-auto max-w-[760px]">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group border-b border-line-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown className="size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180 group-open:text-accent-deep" />
              </summary>
              <div className="max-w-[640px] pb-5 text-[13.5px] leading-relaxed text-ink-2">{item.answer}</div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/FaqSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/FaqSection.tsx src/features/landing/components/__tests__/FaqSection.test.tsx
git commit -m "feat(landing): add FaqSection using native details/summary"
```

---

### Task 12: `AiInsightSpotlight` component (reuses the real `InsightCard`)

**Files:**
- Create: `src/features/landing/components/AiInsightSpotlight.tsx`
- Test: `src/features/landing/components/__tests__/AiInsightSpotlight.test.tsx`

**Interfaces:**
- Consumes: `getInsightsForPeriod` from `@/features/insight/lib/insight-matcher` (existing), `InsightCard` from `@/features/insight/components/InsightCard` (existing), `Reveal` (Task 2).
- Produces: `AiInsightSpotlight()` — no props. Consumed by Task 14.

This is the one component in the whole redesign that must **not** duplicate markup: it renders the actual product's `InsightCard`, fed the actual "yesterday-anomali-1" item (the same live-computed anomaly shown on `/insight` and in Overview's Proactive Alert Card), so the copy "ini tampilan asli" is literally true, not just visually similar.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/AiInsightSpotlight.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { AiInsightSpotlight } from "../AiInsightSpotlight";

test("renders the section copy and the real anomaly insight card", () => {
  render(<AiInsightSpotlight />);
  expect(screen.getByText(/AI yang menjelaskan performa iklan/)).toBeInTheDocument();
  expect(screen.getByText("Spend naik, closing stagnan")).toBeInTheDocument();
  expect(screen.getByText("Anomali")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/AiInsightSpotlight.test.tsx`
Expected: FAIL — `Cannot find module '../AiInsightSpotlight'`.

- [ ] **Step 3: Implement `AiInsightSpotlight`**

Create `src/features/landing/components/AiInsightSpotlight.tsx`:

```tsx
import { InsightCard } from "@/features/insight/components/InsightCard";
import { getInsightsForPeriod } from "@/features/insight/lib/insight-matcher";
import { Reveal } from "./Reveal";

const spotlightItem = getInsightsForPeriod("yesterday").find((item) => item.id === "yesterday-anomali-1")!;

export function AiInsightSpotlight() {
  return (
    <section className="py-[92px]">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-14 px-5 md:grid-cols-2">
        <Reveal>
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">AI Insight</span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold leading-tight tracking-tight md:text-[36px]">
            AI yang menjelaskan performa iklan seperti partner bisnis — bukan analis data.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Bukan sekadar dashboard angka. Setiap hari, Lensa merangkum apa yang berubah, kenapa itu penting buat
            bisnismu, dan apa yang sebaiknya kamu lakukan lebih dulu.
          </p>
          <p className="mt-6 text-[13px] leading-relaxed text-ink-2">
            Contoh di samping ini adalah tampilan asli fitur AI Insight di dalam produk Lensa — bukan mockup
            terpisah.
          </p>
        </Reveal>
        <Reveal>
          <InsightCard item={spotlightItem} />
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/AiInsightSpotlight.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/AiInsightSpotlight.tsx src/features/landing/components/__tests__/AiInsightSpotlight.test.tsx
git commit -m "feat(landing): add AiInsightSpotlight reusing the real InsightCard"
```

---

### Task 13: `StatsSection` component (animated counters)

**Files:**
- Create: `src/features/landing/components/StatsSection.tsx`
- Test: `src/features/landing/components/__tests__/StatsSection.test.tsx`

**Interfaces:**
- Consumes: `Reveal` (Task 2).
- Produces: `StatsSection()` — no props. Consumed by Task 14.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/StatsSection.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { StatsSection } from "../StatsSection";

test("renders all 4 stat labels", () => {
  render(<StatsSection />);
  expect(screen.getByText(/Rata-rata penurunan CPA/)).toBeInTheDocument();
  expect(screen.getByText(/Waktu review harian/)).toBeInTheDocument();
  expect(screen.getByText(/Meta Ads & TikTok Ads tergabung otomatis/)).toBeInTheDocument();
  expect(screen.getByText(/Data selalu diperbarui/)).toBeInTheDocument();
});

test("renders the 2 platform / real-time static stats verbatim", () => {
  render(<StatsSection />);
  expect(screen.getByText("2 Platform")).toBeInTheDocument();
  expect(screen.getByText("Real-time")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/StatsSection.test.tsx`
Expected: FAIL — `Cannot find module '../StatsSection'`.

- [ ] **Step 3: Implement a small `useCountUp` hook + `StatsSection`**

Create `src/features/landing/lib/useCountUp.ts`:

```ts
"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

export function useCountUp(target: number) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return { ref, value };
}
```

Create `src/features/landing/components/StatsSection.tsx`:

```tsx
"use client";

import { Reveal } from "./Reveal";
import { useCountUp } from "../lib/useCountUp";

function CountStat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, value } = useCountUp(target);
  return (
    <div className="p-2 text-center">
      <div className="font-display text-[2.2rem] font-bold tabular-nums text-accent-deep">
        <span ref={ref}>{value}</span>
        {suffix}
      </div>
      <div className="mx-auto mt-2 max-w-[190px] text-[12.5px] leading-snug text-ink-2">{label}</div>
    </div>
  );
}

function StaticStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-2 text-center">
      <div className="font-display text-[2.2rem] font-bold text-accent-deep">{value}</div>
      <div className="mx-auto mt-2 max-w-[190px] text-[12.5px] leading-snug text-ink-2">{label}</div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="border-y border-line bg-card py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Hasil yang Bisa Diukur
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Bukan cuma dashboard yang rapi — ini dampaknya buat bisnismu.
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <CountStat target={32} suffix="%" label="Rata-rata penurunan CPA dalam 90 hari pertama pemakaian" />
          <CountStat target={5} suffix=" menit" label="Waktu review harian — sebelumnya bisa lebih dari 1 jam" />
          <StaticStat value="2 Platform" label="Meta Ads & TikTok Ads tergabung otomatis dalam satu dashboard" />
          <StaticStat value="Real-time" label="Data selalu diperbarui lewat sync otomatis" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/StatsSection.test.tsx`
Expected: PASS. (With the Task 2 `IntersectionObserver` stub, `useInView` never flips to `true` in tests, so the counters render at `0` — that's fine, these tests only assert on the label text, not the animated numbers.)

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/lib/useCountUp.ts src/features/landing/components/StatsSection.tsx src/features/landing/components/__tests__/StatsSection.test.tsx
git commit -m "feat(landing): add StatsSection with animated count-up numbers"
```

---

### Task 14: `TrendChartSection` component (multi-KPI interactive chart)

**Files:**
- Create: `src/features/landing/components/TrendChartSection.tsx`
- Test: `src/features/landing/components/__tests__/TrendChartSection.test.tsx`

**Interfaces:**
- Consumes: `TREND_METRICS`, `TrendMetricKey` (Task 3), `computeTrendDelta` (Task 4), `Reveal` (Task 2).
- Produces: `TrendChartSection()` — no props. Consumed by Task 14 (page assembly — actually Task 15 below).

This replaces the artifact's hand-rolled SVG path/tooltip math with `recharts`' `AreaChart`, matching the exact pattern already used by `overview-dashboard`'s `TrendChart.tsx`/`ChannelChart.tsx` (metric-toggle buttons + a single `<Area>` for both stroke and fill). Recharts re-animates automatically whenever the `data` array reference changes, which is what gives the "chart bergerak" effect on every tab switch — no manual replay logic needed.

- [ ] **Step 1: Write the failing test**

Create `src/features/landing/components/__tests__/TrendChartSection.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TrendChartSection } from "../TrendChartSection";

test("defaults to the ROAS tab, showing its label and an upward delta", () => {
  render(<TrendChartSection />);
  expect(screen.getByRole("tab", { name: "ROAS" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByText("ROAS rata-rata mingguan")).toBeInTheDocument();
  expect(screen.getByText(/▲/)).toBeInTheDocument();
});

test("clicking the CPA tab switches the active tab and shows a downward (good) delta", () => {
  render(<TrendChartSection />);
  fireEvent.click(screen.getByRole("tab", { name: "CPA" }));
  expect(screen.getByRole("tab", { name: "CPA" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByText("CPA rata-rata mingguan")).toBeInTheDocument();
  expect(screen.getByText(/▼/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/features/landing/components/__tests__/TrendChartSection.test.tsx`
Expected: FAIL — `Cannot find module '../TrendChartSection'`.

- [ ] **Step 3: Implement `TrendChartSection`**

Create `src/features/landing/components/TrendChartSection.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Reveal } from "./Reveal";
import { TREND_METRICS } from "../mock-data";
import { computeTrendDelta } from "../lib/trend";
import type { TrendMetricKey } from "../types";

const TABS: TrendMetricKey[] = ["roas", "cpa", "ctr", "closing"];

function TrendTooltip({
  active,
  payload,
  format,
}: {
  active?: boolean;
  payload?: { payload: { week: number; value: number } }[];
  format: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-bold tabular-nums text-white">
      Minggu {point.week} · {format(point.value)}
    </div>
  );
}

export function TrendChartSection() {
  const [metricKey, setMetricKey] = useState<TrendMetricKey>("roas");
  const metric = TREND_METRICS[metricKey];
  const delta = computeTrendDelta(metric);

  return (
    <section id="tren" className="py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Tren Performa Mingguan
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Pantau metrik yang paling penting buat bisnismu — semua dalam satu grafik.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Geser antar metrik buat lihat tren ROAS, CPA, CTR, dan Closing selama 12 minggu terakhir — semua dihitung
            dari data asli yang tersambung ke Lensa.
          </p>
        </Reveal>

        <Reveal className="rounded-[26px] border border-line bg-card p-7 shadow-sm">
          <div className="mb-5 inline-flex gap-1 rounded-[10px] bg-gray-bg p-1" role="tablist" aria-label="Pilih metrik">
            {TABS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={metricKey === key}
                onClick={() => setMetricKey(key)}
                className={`rounded-[7px] px-4 py-2 text-[12.5px] font-bold transition-colors ${
                  metricKey === key ? "bg-card text-ink shadow-sm" : "text-ink-2"
                }`}
              >
                {TREND_METRICS[key].tabLabel}
              </button>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-3">{metric.label}</div>
              <div className="mt-1.5 flex items-baseline gap-2.5 font-display text-[28px] font-bold tabular-nums">
                {metric.format(delta.last)}
                <span className={`font-sans text-sm font-bold ${delta.isGood ? "text-green" : "text-red"}`}>
                  {delta.wentUp ? "▲" : "▼"} {delta.deltaPct}% vs minggu 1
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-2">
              <i className="inline-block size-2.5 rounded-sm bg-accent" />
              {metric.legend}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metric.data}>
              <XAxis
                dataKey="week"
                tickFormatter={(w) => `Minggu ${w}`}
                interval={2}
                tick={{ fontSize: 11, fill: "#9d9da6" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip content={<TrendTooltip format={metric.format} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#c98f00"
                fill="#f0b400"
                fillOpacity={0.18}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#fff", stroke: "#c98f00", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#c98f00" }}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>

          <p className="sr-only">
            Grafik menunjukkan tren {metric.label.toLowerCase()} {delta.wentUp ? "naik" : "turun"} dari{" "}
            {metric.format(delta.first)} di minggu 1 menjadi {metric.format(delta.last)} di minggu 12.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
```

Note: this project's `globals.css` doesn't currently define a `.sr-only` utility — Tailwind ships one built in (the `sr-only` class is a default Tailwind core utility, not a plugin), so no extra CSS is needed here.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/features/landing/components/__tests__/TrendChartSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/landing/components/TrendChartSection.tsx src/features/landing/components/__tests__/TrendChartSection.test.tsx
git commit -m "feat(landing): add multi-KPI interactive TrendChartSection with recharts"
```

---

### Task 15: `TestimonialsSection` + `PricingSection` components

**Files:**
- Create: `src/features/landing/components/TestimonialsSection.tsx`
- Create: `src/features/landing/components/PricingSection.tsx`
- Test: `src/features/landing/components/__tests__/TestimonialsSection.test.tsx`
- Test: `src/features/landing/components/__tests__/PricingSection.test.tsx`

**Interfaces:**
- Consumes: `TESTIMONIALS`, `PRICING_ROWS` (Task 3), `Reveal` (Task 2).
- Produces: `TestimonialsSection()` — no props. `PricingSection({ onOpenCheckout }: { onOpenCheckout: () => void })` — the checkout modal itself stays owned by `page.tsx` (Task 16), matching the existing `page.tsx`/`CheckoutModal` ownership already in place today.

- [ ] **Step 1: Write the failing tests**

Create `src/features/landing/components/__tests__/TestimonialsSection.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { TestimonialsSection } from "../TestimonialsSection";
import { TESTIMONIALS } from "../../mock-data";

test("renders all 3 testimonials with their stat line", () => {
  render(<TestimonialsSection />);
  TESTIMONIALS.forEach((t) => {
    expect(screen.getByText(t.quote)).toBeInTheDocument();
    expect(screen.getByText(t.stat)).toBeInTheDocument();
  });
});
```

Create `src/features/landing/components/__tests__/PricingSection.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { PricingSection } from "../PricingSection";

test("defaults to monthly pricing", () => {
  render(<PricingSection onOpenCheckout={() => {}} />);
  expect(screen.getByText("Rp149rb")).toBeInTheDocument();
});

test("switching to Tahunan updates the Pro price and shows the annual note", () => {
  render(<PricingSection onOpenCheckout={() => {}} />);
  fireEvent.click(screen.getByRole("tab", { name: /Tahunan/ }));
  expect(screen.getByText("Rp119rb")).toBeInTheDocument();
  expect(screen.getByText("Ditagih Rp1.430.400/tahun")).toBeInTheDocument();
});

test("clicking Pilih Pro calls onOpenCheckout", () => {
  const onOpenCheckout = vi.fn();
  render(<PricingSection onOpenCheckout={onOpenCheckout} />);
  fireEvent.click(screen.getByRole("button", { name: "Pilih Pro" }));
  expect(onOpenCheckout).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/features/landing/components/__tests__/TestimonialsSection.test.tsx src/features/landing/components/__tests__/PricingSection.test.tsx`
Expected: FAIL — neither module exists yet.

- [ ] **Step 3: Implement `TestimonialsSection`**

Create `src/features/landing/components/TestimonialsSection.tsx`:

```tsx
import { Reveal } from "./Reveal";
import { TESTIMONIALS } from "../mock-data";

export function TestimonialsSection() {
  return (
    <section className="border-y border-line bg-card py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Dipakai Pemilik Bisnis Kayak Kamu
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Bukan cuma buat toko fashion — semua bisnis yang jualan lewat iklan.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              className={`flex flex-col gap-4 rounded-2xl border border-line bg-bg p-6 ${i === 1 ? "md:translate-y-[18px]" : ""}`}
            >
              <div aria-label="5 dari 5 bintang" className="text-[13px] tracking-[2px] text-accent">
                ★★★★★
              </div>
              <p className="text-sm leading-relaxed text-ink">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="inline-flex w-fit rounded-full bg-accent-bg px-3 py-1 text-[11.5px] font-extrabold text-accent-text">
                {t.stat}
              </div>
              <div className="mt-auto flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-[13px] font-extrabold text-ink">
                  {t.avatarInitial}
                </div>
                <div>
                  <div className="text-[12.5px] font-bold">{t.name}</div>
                  <div className="text-[11px] text-ink-3">{t.business}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `PricingSection`**

Create `src/features/landing/components/PricingSection.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { PRICING_ROWS } from "../mock-data";

type BillingCycle = "monthly" | "annual";

const PRO_PRICE: Record<BillingCycle, { price: string; note: string }> = {
  monthly: { price: "Rp149rb", note: "" },
  annual: { price: "Rp119rb", note: "Ditagih Rp1.430.400/tahun" },
};

export function PricingSection({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const pro = PRO_PRICE[cycle];

  return (
    <section id="harga" className="scroll-mt-20 py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-7 max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Investasi yang Masuk Akal
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Harga yang mudah dipahami, tanpa kejutan di akhir.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Mulai dari gratis. Upgrade begitu bisnismu sudah butuh lebih dari satu platform.
          </p>
        </Reveal>

        <Reveal className="mx-auto mb-7 flex w-fit gap-1 rounded-full bg-gray-bg p-1" role="tablist" aria-label="Siklus tagihan">
          <button
            type="button"
            role="tab"
            aria-selected={cycle === "monthly"}
            onClick={() => setCycle("monthly")}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              cycle === "monthly" ? "bg-card text-ink shadow-sm" : "text-ink-2"
            }`}
          >
            Bulanan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={cycle === "annual"}
            onClick={() => setCycle("annual")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              cycle === "annual" ? "bg-card text-ink shadow-sm" : "text-ink-2"
            }`}
          >
            Tahunan
            <span className="rounded-full bg-green-bg px-2 py-0.5 text-[9.5px] font-extrabold text-green">
              Hemat 20%
            </span>
          </button>
        </Reveal>

        <Reveal className="overflow-x-auto rounded-[26px] border border-line bg-card shadow-sm">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr>
                <th className="w-[34%]" />
                <th className="w-[33%] px-5 pb-4 pt-6 text-left align-bottom border-b border-line">
                  <div className="font-display text-[15px] font-bold">Free</div>
                  <div className="mt-2 font-display text-[26px] font-bold">
                    Rp0<small className="text-xs font-normal text-ink-3">/bulan</small>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3.5 w-full justify-center" asChild>
                    <Link href="/sign-in">Mulai Gratis</Link>
                  </Button>
                </th>
                <th className="w-[33%] bg-accent-bg px-5 pb-4 pt-6 text-left align-bottom border-b border-line">
                  <div className="flex items-center gap-2 font-display text-[15px] font-bold">
                    Pro
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-[9.5px] font-extrabold text-ink">
                      POPULER
                    </span>
                  </div>
                  <div className="mt-2 font-display text-[26px] font-bold">
                    {pro.price}
                    <small className="text-xs font-normal text-ink-3">/bulan</small>
                  </div>
                  <div className="mt-1 min-h-[15px] text-[11px] font-semibold text-ink-3">{pro.note}</div>
                  <Button size="sm" className="mt-3.5 w-full justify-center" onClick={onOpenCheckout}>
                    Pilih Pro
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICING_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="border-b border-line-2 px-5 py-4 text-[13.5px] font-semibold text-ink-2">
                    {row.label}
                  </td>
                  <td className="border-b border-line-2 px-5 py-4 text-[13.5px] font-semibold">{row.free}</td>
                  <td className="border-b border-line-2 bg-accent-bg px-5 py-4 text-[13.5px] font-semibold">
                    {row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/features/landing/components/__tests__/TestimonialsSection.test.tsx src/features/landing/components/__tests__/PricingSection.test.tsx`
Expected: PASS (4 tests total).

- [ ] **Step 6: Commit**

```bash
git add src/features/landing/components/TestimonialsSection.tsx src/features/landing/components/PricingSection.tsx src/features/landing/components/__tests__/TestimonialsSection.test.tsx src/features/landing/components/__tests__/PricingSection.test.tsx
git commit -m "feat(landing): add TestimonialsSection and PricingSection with billing toggle"
```

---

### Task 16: Assemble `src/app/page.tsx` and update its test suite

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: every component from Tasks 5–15, plus the existing `CheckoutModal` (`@/features/landing/components/CheckoutModal`, unchanged).

This is the integration task: it removes the old inline markup and composes the new components in the order: Nav → Hero → ProblemSection → HowItWorks → FeaturesGrid → FaqSection → AiInsightSpotlight → StatsSection → TrendChartSection → TestimonialsSection → PricingSection → final CTA (kept inline, it's a few static lines) → Footer (kept inline, expanded to match the artifact's multi-column footer).

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Nav } from "@/features/landing/components/Nav";
import { Hero } from "@/features/landing/components/Hero";
import { ProblemSection } from "@/features/landing/components/ProblemSection";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { FeaturesGrid } from "@/features/landing/components/FeaturesGrid";
import { FaqSection } from "@/features/landing/components/FaqSection";
import { AiInsightSpotlight } from "@/features/landing/components/AiInsightSpotlight";
import { StatsSection } from "@/features/landing/components/StatsSection";
import { TrendChartSection } from "@/features/landing/components/TrendChartSection";
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection";
import { PricingSection } from "@/features/landing/components/PricingSection";
import { CheckoutModal } from "@/features/landing/components/CheckoutModal";
import { Reveal } from "@/features/landing/components/Reveal";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
});

export default function LandingPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className={bricolage.variable}>
      <Nav />

      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeaturesGrid />
        <FaqSection />
        <AiInsightSpotlight />
        <StatsSection />
        <TrendChartSection />
        <TestimonialsSection />
        <PricingSection onOpenCheckout={() => setCheckoutOpen(true)} />

        <section className="px-5 py-[92px] text-center">
          <Reveal className="mx-auto max-w-[640px]">
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
              Saatnya Coba Sendiri
            </span>
            <h2 className="mt-3.5 font-display text-2xl font-bold tracking-tight md:text-[32px]">
              Lihat performa iklanmu lebih jernih, mulai hari ini.
            </h2>
            <p className="mx-auto mt-2.5 max-w-[420px] text-sm text-ink-3">
              Coba Lensa gratis untuk 1 bisnis — nggak perlu kartu kredit, dan kamu bisa mulai dalam 5 menit.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/sign-in">Mulai Gratis</Link>
            </Button>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line px-5 py-[60px]">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 pb-11 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-accent text-[11px] font-extrabold text-ink">
                L
              </div>
              <span className="font-display font-semibold text-ink-2">Lensa</span>
            </div>
            <p className="mt-3 max-w-[240px] text-[13px] leading-relaxed text-ink-2">
              Satu dashboard untuk semua performa iklanmu — Meta Ads dan TikTok Ads, jernih dalam satu tampilan,
              lengkap dengan AI yang membantu menentukan langkah berikutnya.
            </p>
          </div>
          <div>
            <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Produk</div>
            {[
              { href: "#fitur", label: "Fitur" },
              { href: "#cara-kerja", label: "Cara Kerja" },
              { href: "#harga", label: "Harga" },
              { href: "#faq", label: "FAQ" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Perusahaan</div>
            <a href="#top" className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              Tentang Lensa
            </a>
            <a href="#top" className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              Kontak
            </a>
          </div>
          <div>
            <div className="mb-3.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-3">Legal</div>
            <a href="#top" className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              Ketentuan Layanan
            </a>
            <a href="#top" className="block py-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              Kebijakan Privasi
            </a>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row">
          <span>© 2026 Lensa. Prototype untuk keperluan assessment.</span>
          <span>Dibuat dengan Next.js, Tailwind &amp; AI Insight.</span>
        </div>
      </footer>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/app/__tests__/page.test.tsx`**

The old test suite asserted on markup that no longer exists (the single hardcoded hero card, the old `FREE_FEATURES` bullet list, etc.). Read it first, then replace its entire contents with:

```tsx
import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import LandingPage from "../page";

test("renders the hero heading and primary CTAs linking to /sign-in", () => {
  render(<LandingPage />);
  expect(screen.getByText(/Semua performa iklanmu/)).toBeInTheDocument();
  const ctas = screen.getAllByRole("link", { name: "Mulai Gratis" });
  expect(ctas.length).toBeGreaterThan(0);
  ctas.forEach((cta) => expect(cta).toHaveAttribute("href", "/sign-in"));
});

test("renders every major section in order", () => {
  render(<LandingPage />);
  const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(headings.some((h) => h?.includes("Empat tab kebuka bersamaan"))).toBe(true);
  expect(headings.some((h) => h?.includes("Dari akun yang terpisah"))).toBe(true);
  expect(headings.some((h) => h?.includes("Dirancang buat pemilik bisnis"))).toBe(true);
  expect(headings.some((h) => h?.includes("Masih ada yang mengganjal"))).toBe(true);
  expect(headings.some((h) => h?.includes("AI yang menjelaskan performa iklan"))).toBe(true);
  expect(headings.some((h) => h?.includes("Bukan cuma dashboard yang rapi"))).toBe(true);
  expect(headings.some((h) => h?.includes("Pantau metrik yang paling penting"))).toBe(true);
  expect(headings.some((h) => h?.includes("Bukan cuma buat toko fashion"))).toBe(true);
  expect(headings.some((h) => h?.includes("Harga yang mudah dipahami"))).toBe(true);
});

test("mobile menu toggle updates aria-expanded", () => {
  render(<LandingPage />);
  const toggle = screen.getByLabelText("Buka menu");
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
});

test("Pilih Pro opens the checkout modal and completes the simulated payment flow", () => {
  vi.useFakeTimers();
  render(<LandingPage />);
  fireEvent.click(screen.getByRole("button", { name: "Pilih Pro" }));
  expect(screen.getByText("Mulai Langganan Pro")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Bayar Rp149.000" }));
  expect(screen.getByText("Menghubungkan ke payment gateway…")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1900);
  });
  expect(screen.getByText("Pembayaran Berhasil (Simulasi)")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Lanjut ke Sign In" }));
  expect(pushMock).toHaveBeenCalledWith("/sign-in");
  vi.useRealTimers();
});
```

Note: the checkout flow test always charges `Rp149.000` regardless of the Pricing section's billing-cycle toggle — `CheckoutModal` is unchanged in this plan and still hardcodes the monthly price, which is consistent with the current (pre-redesign) behavior. If you want the checkout summary to reflect the annual price too, that's a follow-up, not part of this plan.

- [ ] **Step 3: Run the full suite, typecheck, and build**

Run: `npx vitest run`
Expected: all test files pass (the full count will be higher than the pre-redesign 73, since this plan adds ~14 new test files).

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: `✓ Compiled successfully`, all routes still generate, including `/`.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, open `/` in a browser, and check:
- Hero mockup tab switch animates the Spend/ROAS numbers and bars.
- Scrolling reveals each section with a fade/slide-in.
- The FAQ section (mid-page, between Fitur and AI Insight) expands/collapses on click.
- The Tren Performa Mingguan chart redraws when switching ROAS/CPA/CTR/Closing tabs, and hovering a point shows a tooltip.
- The Bulanan/Tahunan pricing toggle updates the Pro price and note.
- "Pilih Pro" opens the existing checkout modal end-to-end.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/__tests__/page.test.tsx
git commit -m "feat(landing): assemble the redesigned landing page from the new section components"
```

---

## Post-implementation: update the progress hub

After Task 16 is committed and all checks are green, update `PROGRESS.md` per its standing instruction ("update this file every time a task/plan is completed") — add a new session entry summarizing: which artifact this implements, the component list, the new dependencies actually exercised (`framer-motion`, `recharts` — both already installed, neither previously used), and the final test count.
