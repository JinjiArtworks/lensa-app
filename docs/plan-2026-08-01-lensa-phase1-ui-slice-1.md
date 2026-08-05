# Lensa — Phase 1 UI Slice 1: App Shell + Overview Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the already-validated HTML mockup (`lensa-dashboard-full-interactive_1.html`) into real Next.js/React components — starting with the app shell (sidebar, business switcher UI, top bar with notification dropdown) and the Overview Dashboard page — using local/static state and typed mock data, with **zero Firebase/Firestore wiring yet**. Visual output must match the mockup pixel-for-pixel in spirit (same layout, same amber accent, same copy). Real auth/data-layer wiring is a separate, later plan.

**Architecture:** Each mockup page becomes a route under a shared `(dashboard)` route group whose `layout.tsx` renders the sidebar/topbar shell. Every interactive behavior the mockup did with vanilla JS (tab switching, search/pagination, chart toggles, proactive-alert trigger logic, modals) gets re-implemented as React state/handlers — same behavior, same trigger conditions, just typed and componentized. Charts move from Chart.js to **Recharts** per the stack decision (`business-plan.md` §7). Modals use shadcn/ui `Dialog`; status pills/progress bars use shadcn/ui `Badge`/`Progress` reconciled to this project's tokens per the documented procedure in `31-frontend-nextjs.md`.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind v3 (this project's existing token setup), shadcn/ui (`@2` pin — see `31-frontend-nextjs.md`), Recharts, Vitest + React Testing Library.

## Global Constraints

- **No Firebase/Firestore calls anywhere in this plan.** All data is local TypeScript mock objects/arrays living in `src/features/overview-dashboard/mock-data.ts`. This is a deliberate, temporary placeholder for this UI-slicing phase — a later plan replaces it with a real mock-data-service layer behind TanStack Query hooks. Do not silently wire anything to Firebase; if a step seems to need it, that's out of scope, note it and move on.
- **No new routes require auth yet.** Pages in this plan are reachable directly by URL for manual verification — auth gating is a separate later plan.
- Accent color = amber/gold `#f0b400` / `#fff6d6` / `#8a6400` — per `design-system.md`. All new components must use this project's existing Tailwind color tokens (`bg-accent`, `text-ink`, `border-line`, etc. from `tailwind.config.ts`), never hardcoded hex values in component code.
- Sidebar nav = **Overview, Detail Platform, AI Insight** (no Support) under "Menu"; **Billing, Settings, Connect Platform** under "Lainnya" — per `design-system.md`'s finalized structure. Do not add a Support or Pricing nav item.
- No "Compare 2 Platform" anywhere — cut from scope (`business-plan.md` §9).
- When adding any shadcn/ui component in this plan, follow the exact procedure in `31-frontend-nextjs.md`'s "Adding new shadcn/ui components" section: use `npx shadcn@2 add <component>`, never `@latest`; check `tailwind.config.ts`/`globals.css` for duplicate `:root` blocks or `hsl()`/`oklch()` nesting afterward; remap semantic color keys to this project's own tokens; re-run `npx tsc --noEmit && npm run build` before considering the step done.
- Feature-based folder structure per `31-frontend-nextjs.md`: `src/features/<feature>/{components,hooks,api}`, no business logic in `src/app/`.
- Max 2 Zustand stores total in the app (`ui` + `auth`, already created in Phase 0) — this plan's local UI state (search text, active chip, modal open/closed) belongs in component-local `useState`, **not** new Zustand stores.
- No git repository in the parent `Assessment/` folder — every "commit" step is a manual checkpoint instead. The nested git repo inside `lensa-app/` (from `create-next-app`) exists and may be used freely for local checkpointing/diffing during this plan's work if useful, but nothing gets pushed anywhere.

---

## File Structure

- Create: `src/features/overview-dashboard/mock-data.ts` — typed mock data (platforms, campaigns, targets, chart series) ported from the HTML mockup's JS globals.
- Create: `src/features/overview-dashboard/lib/proactive-alert.ts` — the spend-spike/closing-stagnant trigger logic (pure function, unit-testable in isolation).
- Create: `src/features/app-shell/components/Sidebar.tsx`, `BusinessSwitcher.tsx`, `TopBar.tsx`, `NotificationDropdown.tsx` — the shared shell.
- Create: `src/app/(dashboard)/layout.tsx` — wraps all dashboard pages with the shell.
- Create: `src/app/(dashboard)/overview/page.tsx` — the Overview page itself, composed from feature components below.
- Create: `src/features/overview-dashboard/components/KpiGrid.tsx`, `CoverageBanner.tsx`, `TargetTracker.tsx`, `ProactiveAlertCard.tsx`, `ChannelChart.tsx`, `TrendChart.tsx`, `CampaignTable.tsx`, `CampaignDetailModal.tsx`, `SetTargetModal.tsx`.
- Modify: `src/app/globals.css` / `tailwind.config.ts` — only if a shadcn `add` step requires reconciliation (per the documented procedure).

---

## Task 1: Add shadcn Dialog, Badge, and Progress primitives

**Files:**
- Create (via CLI, then reconciled by hand): `src/components/ui/dialog.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/progress.tsx`
- Modify (only if the CLI touches them — check, don't assume): `tailwind.config.ts`, `src/app/globals.css`

**Interfaces:**
- Produces: `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogTrigger` from `@/components/ui/dialog`; `Badge` (with `variant` prop) from `@/components/ui/badge`; `Progress` (with `value` prop 0-100) from `@/components/ui/progress` — all later tasks in this plan import these exact names.

- [x] **Step 1: Add the three components with the pinned-compatible CLI version**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npx shadcn@2 add dialog badge progress --overwrite
```
If it prompts interactively despite non-interactive flags, pipe an Enter to accept the default: `printf '\n' | npx shadcn@2 add dialog badge progress --overwrite`.

- [x] **Step 2: Check whether `tailwind.config.ts` or `globals.css` were touched**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && git diff --stat tailwind.config.ts src/app/globals.css
```
If either shows changes: read the diff (`git diff tailwind.config.ts src/app/globals.css`), and if it re-introduces a duplicate `:root` block or `hsl(var(...))`/`oklch(...)` values, remove/fix them the same way Task 5 of the Phase 0 plan did — keep exactly one `:root` block in `globals.css` (this project's own tokens) and keep every `tailwind.config.ts` color key pointing straight at `var(--*)` with no wrapping function. If nothing changed, skip this step.

- [x] **Step 3: Confirm the generated component files use plain Tailwind v3 syntax**

Read `src/components/ui/dialog.tsx`, `badge.tsx`, `progress.tsx`. Confirm none of them import from `@base-ui/react`, and none use bracketed arbitrary-value functions (`gap-(--x)`, `--spacing()`, `@container/`). They should use `@radix-ui/react-dialog` (or similar Radix primitive) and plain utility classes, matching the pattern already established by `button.tsx`/`card.tsx`.

- [x] **Step 4: Reconcile `Badge` variant colors to this project's status-color tokens**

The generated `badge.tsx` likely has `default`/`secondary`/`destructive`/`outline` variants pointing at the shadcn semantic keys already wired in Task 5 of Phase 0 (`primary`, `secondary`, `destructive`) — those already resolve to this project's tokens, so no change needed there. But add project-specific status variants matching the mockup's `.status-pill` categories, by extending the `cva` variants object in `badge.tsx`:

```tsx
// add these keys inside the existing `variants.variant` object in badge.tsx, alongside default/secondary/destructive/outline
status: {
  active: "border-transparent bg-green-bg text-green",
  paused: "border-transparent bg-gray-bg text-ink-2",
  pending: "border-transparent bg-amber-bg text-amber",
  archived: "border-transparent bg-red-bg text-red",
},
```
(Exact insertion point depends on the generated file's structure — add these as new entries in the `variant` map, don't replace the existing default/secondary/destructive/outline entries.)

No separate type edit is needed: `VariantProps<typeof badgeVariants>` (the type the generated component already exports/uses) is inferred directly from the `cva(...)` call, so adding `active`/`paused`/`pending`/`archived` keys to the `variants.variant` object automatically makes `<Badge variant="active">`, `<Badge variant="paused">`, `<Badge variant="pending">`, `<Badge variant="archived">` type-check — these four exact string values map 1:1 to the mockup's `.status-pill.active/.paused/.pending/.archived` classes.

- [x] **Step 5: Verify**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npx tsc --noEmit && npm run build
```
Expected: both exit 0, no errors.

---

## Task 2: App shell — Sidebar, Business Switcher (UI-only), Top Bar, Notification Dropdown

**Files:**
- Create: `src/features/app-shell/components/Sidebar.tsx`
- Create: `src/features/app-shell/components/BusinessSwitcher.tsx`
- Create: `src/features/app-shell/components/TopBar.tsx`
- Create: `src/features/app-shell/components/NotificationDropdown.tsx`
- Create: `src/features/app-shell/mock-data.ts` (business list + activity feed items — local placeholders, replaced by real Firestore data in the later wiring plan)
- Create: `src/app/(dashboard)/layout.tsx`
- Test: `src/features/app-shell/components/__tests__/Sidebar.test.tsx`, `BusinessSwitcher.test.tsx`, `NotificationDropdown.test.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/button` (Task 5 of Phase 0).
- Produces: `<DashboardLayout>` (default export of `layout.tsx`) — every page created in Task 3+ of this plan renders inside it automatically via Next.js route-group nesting. `NAV_ITEMS` constant (exported from `Sidebar.tsx`) listing `{ href, label, icon }` for Overview/Detail Platform/AI Insight/Billing/Settings/Connect Platform — later tasks reference this list's exact `href` values when linking between pages (`/overview`, `/detail`, `/insight`, `/billing`, `/settings`, `/connect-platform`).

- [x] **Step 1: Write the mock business/activity data**

Create `src/features/app-shell/mock-data.ts`:
```ts
export interface MockBusiness {
  id: string;
  name: string;
  initials: string;
  plan: "Free" | "Pro";
}

export const MOCK_BUSINESSES: MockBusiness[] = [
  { id: "toko-baju-sinta", name: "Toko Baju Sinta", initials: "TB", plan: "Pro" },
  { id: "warung-kopi-kita", name: "Warung Kopi Kita", initials: "WK", plan: "Pro" },
];

export interface ActivityItem {
  id: string;
  status: "ok" | "err";
  title: string;
  time: string;
  linkLabel: string;
  linkHref: string;
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "1", status: "ok", title: "Campaign Autumn Collection published successfully.", time: "2 jam lalu", linkLabel: "Buka detail", linkHref: "/overview" },
  { id: "2", status: "err", title: "Error: Creative missing headline text.", time: "2 jam lalu", linkLabel: "Buka detail", linkHref: "/detail" },
  { id: "3", status: "ok", title: "Campaign Summer Sale 2025 approved.", time: "2 jam lalu", linkLabel: "Buka detail", linkHref: "/overview" },
  { id: "4", status: "ok", title: "Insight baru dari TikTok Ads tersedia.", time: "4 jam lalu", linkLabel: "Buka detail", linkHref: "/insight" },
];
```

- [x] **Step 2: Write the failing render tests for `BusinessSwitcher`**

Create `src/features/app-shell/components/__tests__/BusinessSwitcher.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { BusinessSwitcher } from "../BusinessSwitcher";

test("shows the active business name and plan", () => {
  render(<BusinessSwitcher />);
  expect(screen.getByText("Toko Baju Sinta")).toBeInTheDocument();
  expect(screen.getByText("Pro plan")).toBeInTheDocument();
});

test("clicking the switcher opens the dropdown listing all businesses", () => {
  render(<BusinessSwitcher />);
  fireEvent.click(screen.getByRole("button", { name: /Toko Baju Sinta/i }));
  expect(screen.getByText("Warung Kopi Kita")).toBeInTheDocument();
  expect(screen.getByText("+ Tambah Bisnis Baru")).toBeInTheDocument();
});

test("selecting a different business updates the active name", () => {
  render(<BusinessSwitcher />);
  fireEvent.click(screen.getByRole("button", { name: /Toko Baju Sinta/i }));
  fireEvent.click(screen.getByText("Warung Kopi Kita"));
  expect(screen.getAllByText("Warung Kopi Kita").length).toBeGreaterThan(0);
});
```

- [x] **Step 3: Run the tests to verify they fail (component doesn't exist yet)**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- BusinessSwitcher
```
Expected: FAIL — `Cannot find module '../BusinessSwitcher'`.

- [x] **Step 4: Implement `BusinessSwitcher`**

Create `src/features/app-shell/components/BusinessSwitcher.tsx`:
```tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MOCK_BUSINESSES } from "../mock-data";

export function BusinessSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(MOCK_BUSINESSES[0].id);
  const active = MOCK_BUSINESSES.find((b) => b.id === activeId)!;

  return (
    <div className="relative mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg border border-line bg-bg p-2.5 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-[11px] font-bold text-accent-text">
          {active.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-bold leading-tight text-ink">{active.name}</span>
          <span className="block text-[10.5px] font-semibold text-accent-text">{active.plan} plan</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-2" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 max-h-64 overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-lg">
          {MOCK_BUSINESSES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setActiveId(b.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg p-2 text-left text-[12.5px] ${
                b.id === activeId ? "bg-accent-bg font-bold text-accent-text" : "hover:bg-bg"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10.5px] font-bold ${
                  b.id === activeId ? "bg-accent text-ink" : "bg-gray-bg text-ink-2"
                }`}
              >
                {b.initials}
              </span>
              {b.name}
            </button>
          ))}
          <hr className="my-1.5 border-line" />
          <button
            type="button"
            className="w-full rounded-lg p-2 text-left text-[12.5px] font-bold text-accent-text hover:bg-bg"
          >
            + Tambah Bisnis Baru
          </button>
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 5: Run the tests to verify they pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- BusinessSwitcher
```
Expected: PASS, 3/3.

- [x] **Step 6: Write the failing test for `NotificationDropdown`**

Create `src/features/app-shell/components/__tests__/NotificationDropdown.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationDropdown } from "../NotificationDropdown";

test("activity feed is hidden until the bell is clicked", () => {
  render(<NotificationDropdown />);
  expect(screen.queryByText("Activity Feed")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /notifikasi/i }));
  expect(screen.getByText("Activity Feed")).toBeInTheDocument();
  expect(screen.getByText(/Insight baru dari TikTok Ads tersedia/)).toBeInTheDocument();
});

test("clicking the close icon hides it again", () => {
  render(<NotificationDropdown />);
  fireEvent.click(screen.getByRole("button", { name: /notifikasi/i }));
  fireEvent.click(screen.getByRole("button", { name: /tutup/i }));
  expect(screen.queryByText("Activity Feed")).not.toBeInTheDocument();
});
```

- [x] **Step 7: Run to verify failure, then implement `NotificationDropdown`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- NotificationDropdown
```
Expected: FAIL (module not found).

Create `src/features/app-shell/components/NotificationDropdown.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import Link from "next/link";
import { MOCK_ACTIVITY } from "../mock-data";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="notifikasi"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-full bg-gray-bg text-ink-2"
      >
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red" />
        <Bell className="size-[18px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[55] max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-line bg-card p-4.5 shadow-xl">
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="text-sm font-bold">Activity Feed</h3>
            <button type="button" aria-label="tutup" onClick={() => setOpen(false)} className="text-ink-3">
              <X className="size-4" />
            </button>
          </div>
          {MOCK_ACTIVITY.map((item) => (
            <div key={item.id} className="flex gap-2.5 border-b border-line-2 py-2.5 last:border-b-0">
              <span
                className={`mt-1.5 size-1.5 shrink-0 rounded-full ${item.status === "ok" ? "bg-green" : "bg-red"}`}
              />
              <div>
                <div className="text-[12.5px] font-semibold leading-snug">{item.title}</div>
                <div className="mt-0.5 text-[11px] text-ink-3">{item.time}</div>
                <Link
                  href={item.linkHref}
                  onClick={() => setOpen(false)}
                  className="mt-0.5 block text-[11.5px] font-semibold text-accent-text"
                >
                  {item.linkLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 8: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- NotificationDropdown
```
Expected: PASS, 2/2.

- [x] **Step 9: Write the failing test for `Sidebar`**

Create `src/features/app-shell/components/__tests__/Sidebar.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Sidebar } from "../Sidebar";

test("renders the Menu section without a Support item", () => {
  render(<Sidebar activePath="/overview" />);
  expect(screen.getByText("Overview")).toBeInTheDocument();
  expect(screen.getByText("Detail Platform")).toBeInTheDocument();
  expect(screen.getByText("AI Insight")).toBeInTheDocument();
  expect(screen.queryByText("Support")).not.toBeInTheDocument();
});

test("renders the Lainnya section with Billing, Settings, Connect Platform", () => {
  render(<Sidebar activePath="/overview" />);
  expect(screen.getByText("Billing")).toBeInTheDocument();
  expect(screen.getByText("Settings")).toBeInTheDocument();
  expect(screen.getByText("Connect Platform")).toBeInTheDocument();
  expect(screen.queryByText("Pricing")).not.toBeInTheDocument();
});
```

- [x] **Step 10: Run to verify failure, then implement `Sidebar`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- Sidebar
```
Expected: FAIL (module not found).

Create `src/features/app-shell/components/Sidebar.tsx`:
```tsx
import Link from "next/link";
import { LayoutDashboard, BarChart3, Sparkles, CreditCard, Settings, Plus } from "lucide-react";
import { BusinessSwitcher } from "./BusinessSwitcher";

export const NAV_ITEMS = {
  menu: [
    { href: "/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/detail", label: "Detail Platform", icon: BarChart3 },
    { href: "/insight", label: "AI Insight", icon: Sparkles },
  ],
  lainnya: [
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/connect-platform", label: "Connect Platform", icon: Plus },
  ],
};

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-line bg-card p-3.5">
      <div className="flex items-center gap-2 px-1.5 pb-4 pt-1 text-[15px] font-extrabold">
        <span className="flex size-6.5 items-center justify-center rounded-lg bg-accent text-xs text-ink">L</span>
        Lensa
      </div>

      <BusinessSwitcher />

      <div className="px-2.5 pb-2 pt-3.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-3">Menu</div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.menu.map((item) => (
          <NavLink key={item.href} item={item} active={activePath === item.href} />
        ))}
      </nav>

      <div className="px-2.5 pb-2 pt-3.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-3">Lainnya</div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.lainnya.map((item) => (
          <NavLink key={item.href} item={item} active={activePath === item.href} />
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#ffe27a] text-xs font-bold text-ink">
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-bold">Sinta W.</div>
          <div className="text-[10.5px] text-ink-3">Owner</div>
        </div>
        <Link href="/settings" className="shrink-0 text-ink-3">
          <Settings className="size-4" />
        </Link>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium ${
        active ? "bg-accent text-ink" : "text-ink-2 hover:bg-bg"
      }`}
    >
      <Icon className="size-[17px] shrink-0" />
      {item.label}
    </Link>
  );
}
```

- [x] **Step 11: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- Sidebar
```
Expected: PASS, 2/2.

- [x] **Step 12: Write `TopBar`** (no test — trivial composition, covered by the layout smoke check in Step 14)

Create `src/features/app-shell/components/TopBar.tsx`:
```tsx
import { NotificationDropdown } from "./NotificationDropdown";

export function TopBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-line bg-card">
      <div className="flex items-center justify-end gap-2.5 px-6.5 py-3">
        <NotificationDropdown />
      </div>
    </div>
  );
}
```

- [x] **Step 13: Write the dashboard layout**

Create `src/app/(dashboard)/layout.tsx`:
```tsx
import { Sidebar } from "@/features/app-shell/components/Sidebar";
import { TopBar } from "@/features/app-shell/components/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-start">
      <Sidebar activePath="/overview" />
      <div className="min-w-0 flex-1">
        <TopBar />
        <main className="mx-auto max-w-[1260px] px-6.5 py-6 pb-15">{children}</main>
      </div>
    </div>
  );
}
```
Note: `activePath` is hardcoded to `/overview` for now since this layout doesn't yet know the current route — fix this in Step 14 using `usePathname`.

- [x] **Step 14: Make the sidebar active-state route-aware**

`layout.tsx` is a Server Component by default and can't call `usePathname()` directly. Convert `Sidebar`'s active-path detection into the component itself using the `usePathname` client hook instead of a prop, so `layout.tsx` stays simple:

Modify `src/features/app-shell/components/Sidebar.tsx` — replace the `{ activePath }: { activePath: string }` prop with an internal hook call:
```tsx
"use client";

import { usePathname } from "next/navigation";
// ...rest of imports unchanged

export function Sidebar() {
  const activePath = usePathname();
  // ...rest of the function body unchanged, just remove the prop from the signature
```

Modify `src/app/(dashboard)/layout.tsx` to drop the prop:
```tsx
<Sidebar />
```

Update `src/features/app-shell/components/__tests__/Sidebar.test.tsx` to drop the now-removed prop:
```tsx
render(<Sidebar activePath="/overview" />);
```
becomes
```tsx
render(<Sidebar />);
```
(both occurrences in the file). Since `usePathname` needs a Next.js router context, also add this mock at the top of the test file:
```tsx
import { vi } from "vitest";
vi.mock("next/navigation", () => ({
  usePathname: () => "/overview",
}));
```

- [x] **Step 15: Run the full test suite and build**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all tests pass, no type errors, build succeeds.

- [x] **Step 16: Manual checkpoint**

Run `npm run dev`, visit `http://localhost:3000/overview` (the page doesn't exist yet — Task 3 creates it — a 404 here is expected and fine for now). Confirm the shell itself would render correctly by temporarily visiting any existing route, or defer full visual confirmation to Task 3's manual checkpoint once a real page exists inside the layout.

---

## Task 3: Overview — KPI grid, coverage banner, target tracker, proactive alert card

**Files:**
- Create: `src/features/overview-dashboard/mock-data.ts`
- Create: `src/features/overview-dashboard/lib/proactive-alert.ts`
- Create: `src/features/overview-dashboard/lib/__tests__/proactive-alert.test.ts`
- Create: `src/features/overview-dashboard/components/KpiGrid.tsx`
- Create: `src/features/overview-dashboard/components/CoverageBanner.tsx`
- Create: `src/features/overview-dashboard/components/TargetTracker.tsx`
- Create: `src/features/overview-dashboard/components/ProactiveAlertCard.tsx`
- Create: `src/app/(dashboard)/overview/page.tsx`
- Test: `src/features/overview-dashboard/components/__tests__/KpiGrid.test.tsx`, `TargetTracker.test.tsx`, `ProactiveAlertCard.test.tsx`

**Interfaces:**
- Produces: `PLATFORMS`, `KPI_DATA`, `TARGETS`, `ACTUALS` exported from `mock-data.ts` — Task 4 and Task 5 of this plan import `PLATFORMS` for chart/table data.
- Produces: `shouldShowProactiveAlert(platforms: typeof PLATFORMS): { show: boolean; platformName?: string; spendPct?: number }` from `lib/proactive-alert.ts`.

- [x] **Step 1: Write the mock data, ported from the HTML mockup's JS globals**

Create `src/features/overview-dashboard/mock-data.ts`:
```ts
export interface MetricEntry {
  value: string;
  cls: "up" | "down" | "";
  sub: string;
}

export interface PlatformData {
  name: string;
  ic: string;
  metrics: Record<string, MetricEntry>;
}

export const PLATFORMS: Record<"meta" | "tiktok", PlatformData> = {
  meta: {
    name: "Meta Ads",
    ic: "M",
    metrics: {
      Spend: { value: "Rp2,4jt", cls: "up", sub: "▲ 8% vs periode lalu" },
      Closing: { value: "40", cls: "up", sub: "▲ 12% vs periode lalu" },
      ROAS: { value: "2.9x", cls: "up", sub: "▲ 5% vs periode lalu" },
      CPA: { value: "Rp60rb", cls: "up", sub: "▼ 3% vs periode lalu" },
      CTR: { value: "3.6%", cls: "up", sub: "▲ 0.4% vs periode lalu" },
      Impresi: { value: "128rb", cls: "up", sub: "▲ 9% vs periode lalu" },
      Klik: { value: "4.600", cls: "up", sub: "▲ 7% vs periode lalu" },
      "Campaign Aktif": { value: "7", cls: "up", sub: "▲ 1 campaign baru" },
    },
  },
  tiktok: {
    name: "TikTok Ads",
    ic: "TT",
    metrics: {
      Spend: { value: "Rp1,4jt", cls: "up", sub: "▲ 32% vs periode lalu" },
      Closing: { value: "22", cls: "up", sub: "▲ 1% vs periode lalu" },
      ROAS: { value: "2.3x", cls: "down", sub: "▼ 6% vs periode lalu" },
      CPA: { value: "Rp63rb", cls: "down", sub: "▲ 5% vs periode lalu" },
      CTR: { value: "2.8%", cls: "down", sub: "▼ 9% vs periode lalu" },
      Impresi: { value: "96rb", cls: "up", sub: "▲ 14% vs periode lalu" },
      Klik: { value: "2.900", cls: "up", sub: "▲ 3% vs periode lalu" },
      "Campaign Aktif": { value: "5", cls: "", sub: "Tidak ada perubahan" },
    },
  },
};

export const KPI_ROW_1 = [
  { label: "Total Spend", value: "Rp3,8jt", cls: "up" as const, sub: "▲ 10% vs minggu lalu" },
  { label: "Total Closing", value: "62", cls: "up" as const, sub: "▲ 8% vs minggu lalu" },
  { label: "ROAS", value: "2.7x", cls: "down" as const, sub: "▼ 3% vs minggu lalu" },
  { label: "CPA", value: "Rp61rb", cls: "up" as const, sub: "▼ 4% vs minggu lalu" },
];

export const KPI_ROW_2 = [
  { label: "CTR", value: "3.3%", cls: "down" as const, sub: "▼ 0.3% vs minggu lalu" },
  { label: "Impresi", value: "224rb", cls: "up" as const, sub: "▲ 6% vs minggu lalu" },
  { label: "Klik", value: "7.500", cls: "up" as const, sub: "▲ 4% vs minggu lalu" },
  { label: "Campaign Aktif", value: "12", cls: "up" as const, sub: "▲ 2 campaign baru" },
];

export const TARGETS = { roas: 3.5, closing: 90 };
export const ACTUALS = { roas: 2.7, closing: 62 };

export const CONNECTED_PLATFORM_COUNT = 2;
export const TOTAL_PLATFORM_CATALOG = 2; // becomes 4 once GA/Marketplace Ads are added in a later plan
```

- [x] **Step 2: Write the failing test for the proactive-alert trigger logic**

Create `src/features/overview-dashboard/lib/__tests__/proactive-alert.test.ts`:
```ts
import { shouldShowProactiveAlert } from "../proactive-alert";
import { PLATFORMS } from "../../mock-data";

test("triggers for a platform with spend spike and stagnant closing", () => {
  const result = shouldShowProactiveAlert(PLATFORMS);
  expect(result.show).toBe(true);
  expect(result.platformName).toBe("TikTok Ads");
  expect(result.spendPct).toBe(32);
});

test("does not trigger when no platform meets both conditions", () => {
  const healthy = {
    meta: PLATFORMS.meta,
    tiktok: {
      ...PLATFORMS.tiktok,
      metrics: {
        ...PLATFORMS.tiktok.metrics,
        Spend: { value: "Rp1,4jt", cls: "up" as const, sub: "▲ 5% vs periode lalu" },
      },
    },
  };
  expect(shouldShowProactiveAlert(healthy).show).toBe(false);
});
```

- [x] **Step 3: Run to verify failure**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- proactive-alert
```
Expected: FAIL (module not found).

- [x] **Step 4: Implement the trigger logic**

Create `src/features/overview-dashboard/lib/proactive-alert.ts`:
```ts
import type { PlatformData } from "../mock-data";

const SPEND_SPIKE_PCT = 20;
const CLOSING_STAGNANT_PCT = 5;

function parsePct(sub: string): number {
  const match = sub.match(/(\d+(?:\.\d+)?)%/);
  return match ? parseFloat(match[1]) : 0;
}

export function shouldShowProactiveAlert(
  platforms: Record<string, PlatformData>
): { show: boolean; platformName?: string; spendPct?: number } {
  for (const key of Object.keys(platforms)) {
    const p = platforms[key];
    const spendUp = p.metrics.Spend.sub.includes("▲") && parsePct(p.metrics.Spend.sub) >= SPEND_SPIKE_PCT;
    const closingStagnant = parsePct(p.metrics.Closing.sub) < CLOSING_STAGNANT_PCT;
    if (spendUp && closingStagnant) {
      return { show: true, platformName: p.name, spendPct: Math.round(parsePct(p.metrics.Spend.sub)) };
    }
  }
  return { show: false };
}
```

- [x] **Step 5: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- proactive-alert
```
Expected: PASS, 2/2.

- [x] **Step 6: Write the failing test for `KpiGrid`**

Create `src/features/overview-dashboard/components/__tests__/KpiGrid.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { KpiGrid } from "../KpiGrid";
import { KPI_ROW_1, KPI_ROW_2 } from "../../mock-data";

test("renders all 8 KPI cards with label and value", () => {
  render(<KpiGrid />);
  [...KPI_ROW_1, ...KPI_ROW_2].forEach((kpi) => {
    expect(screen.getByText(kpi.label)).toBeInTheDocument();
    expect(screen.getByText(kpi.value)).toBeInTheDocument();
  });
});
```

- [x] **Step 7: Run to verify failure, then implement `KpiGrid`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- KpiGrid
```
Expected: FAIL.

Create `src/features/overview-dashboard/components/KpiGrid.tsx`:
```tsx
import { KPI_ROW_1, KPI_ROW_2 } from "../mock-data";

function KpiCard({ label, value, cls, sub }: { label: string; value: string; cls: "up" | "down"; sub: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-2 text-xs text-ink-2">{label}</div>
      <div className="mb-1.5 text-xl font-extrabold tracking-tight">{value}</div>
      <div className={`text-[11px] font-semibold ${cls === "up" ? "text-green" : "text-red"}`}>{sub}</div>
    </div>
  );
}

export function KpiGrid() {
  return (
    <>
      <div className="mb-3 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
        {KPI_ROW_1.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="mb-3 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
        {KPI_ROW_2.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
    </>
  );
}
```

- [x] **Step 8: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- KpiGrid
```
Expected: PASS, 1/1.

- [x] **Step 9: Write `CoverageBanner`** (static text for this UI-only phase — no test, trivial)

Create `src/features/overview-dashboard/components/CoverageBanner.tsx`:
```tsx
import { AlertCircle } from "lucide-react";
import { CONNECTED_PLATFORM_COUNT, TOTAL_PLATFORM_CATALOG } from "../mock-data";

export function CoverageBanner() {
  return (
    <div className="mb-3.5 flex items-center gap-2.5 rounded-2xl bg-accent-bg px-4 py-2.5">
      <AlertCircle className="size-4 shrink-0 text-accent" />
      <div className="text-xs text-accent-text">
        Metrik di bawah ini adalah gabungan dari <b>{CONNECTED_PLATFORM_COUNT} dari {TOTAL_PLATFORM_CATALOG}</b>{" "}
        platform yang terhubung (Meta Ads, TikTok Ads) — sudah mencakup semua data platformmu.
      </div>
    </div>
  );
}
```

- [x] **Step 10: Write the failing test for `TargetTracker`**

Create `src/features/overview-dashboard/components/__tests__/TargetTracker.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { TargetTracker } from "../TargetTracker";

test("shows ROAS and Closing progress with percentage reached", () => {
  render(<TargetTracker />);
  expect(screen.getByText("ROAS")).toBeInTheDocument();
  expect(screen.getByText(/2\.7x.*target 3\.5x/)).toBeInTheDocument();
  expect(screen.getByText("Closing")).toBeInTheDocument();
  expect(screen.getByText(/69% tercapai/)).toBeInTheDocument();
});
```
(69% = Math.round(62/90*100) = Math.round(68.888...) = 69)

- [x] **Step 11: Run to verify failure, then implement `TargetTracker`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- TargetTracker
```
Expected: FAIL.

Create `src/features/overview-dashboard/components/TargetTracker.tsx`:
```tsx
import { Progress } from "@/components/ui/progress";
import { TARGETS, ACTUALS } from "../mock-data";

interface Row {
  name: string;
  cur: number;
  tgt: number;
  fmt: (v: number) => string;
}

const ROWS: Row[] = [
  { name: "ROAS", cur: ACTUALS.roas, tgt: TARGETS.roas, fmt: (v) => `${v.toFixed(1)}x` },
  { name: "Closing", cur: ACTUALS.closing, tgt: TARGETS.closing, fmt: (v) => `${Math.round(v)} transaksi` },
];

export function TargetTracker() {
  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-4.5">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">Target Bulan Ini</h3>
          <div className="mt-0.5 text-[11.5px] text-ink-3">Progres aktual dibanding target yang kamu set.</div>
        </div>
      </div>
      {ROWS.map((row) => {
        const pct = row.tgt > 0 ? Math.round((row.cur / row.tgt) * 100) : 0;
        const clamped = Math.max(0, Math.min(100, pct));
        const note = pct >= 100 ? "Target tercapai — mantap!" : `${100 - pct}% lagi menuju target bulan ini`;
        return (
          <div key={row.name} className="border-b border-line-2 py-2.5 last:border-b-0">
            <div className="mb-1.5 flex items-baseline justify-between gap-2.5">
              <span className="text-[12.5px] font-bold">{row.name}</span>
              <span className="text-[11.5px] text-ink-2">
                <b className="text-ink">{row.fmt(row.cur)}</b> / target {row.fmt(row.tgt)}
              </span>
            </div>
            <Progress value={clamped} className="h-2" />
            <div className="mt-1.5 text-[11px] text-ink-3">
              {pct}% tercapai · {note}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [x] **Step 12: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- TargetTracker
```
Expected: PASS, 1/1.

- [x] **Step 13: Write the failing test for `ProactiveAlertCard`**

Create `src/features/overview-dashboard/components/__tests__/ProactiveAlertCard.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { ProactiveAlertCard } from "../ProactiveAlertCard";

test("renders visibly when the trigger condition is met (current mock data)", () => {
  render(<ProactiveAlertCard />);
  expect(screen.getByText(/Spend TikTok Ads naik 32%/)).toBeInTheDocument();
});
```

- [x] **Step 14: Run to verify failure, then implement `ProactiveAlertCard`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- ProactiveAlertCard
```
Expected: FAIL.

Create `src/features/overview-dashboard/components/ProactiveAlertCard.tsx`:
```tsx
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { PLATFORMS } from "../mock-data";
import { shouldShowProactiveAlert } from "../lib/proactive-alert";

export function ProactiveAlertCard() {
  const alert = shouldShowProactiveAlert(PLATFORMS);
  if (!alert.show) return null;

  return (
    <Link
      href="/insight"
      className="mb-3.5 flex cursor-pointer items-center gap-3 rounded-2xl border-l-4 border-red bg-card p-4"
    >
      <AlertCircle className="size-[17px] shrink-0 text-red" />
      <div className="flex-1 text-[12.5px] text-ink-2">
        <b className="text-ink">
          Spend {alert.platformName} naik {alert.spendPct}%
        </b>{" "}
        tapi closing stagnan minggu ini — cek AI Insight untuk saran.
      </div>
      <span className="whitespace-nowrap text-xs font-bold text-accent">Lihat detail →</span>
    </Link>
  );
}
```

- [x] **Step 15: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- ProactiveAlertCard
```
Expected: PASS, 1/1.

- [x] **Step 16: Assemble the Overview page with what exists so far**

Create `src/app/(dashboard)/overview/page.tsx`:
```tsx
import { KpiGrid } from "@/features/overview-dashboard/components/KpiGrid";
import { CoverageBanner } from "@/features/overview-dashboard/components/CoverageBanner";
import { TargetTracker } from "@/features/overview-dashboard/components/TargetTracker";
import { ProactiveAlertCard } from "@/features/overview-dashboard/components/ProactiveAlertCard";

export default function OverviewPage() {
  return (
    <div>
      <div className="mb-4.5 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">Dashboard</h1>
          <div className="mt-0.5 text-xs text-ink-3">Toko Baju Sinta · data terakhir diperbarui 12 menit lalu</div>
        </div>
      </div>
      <CoverageBanner />
      <KpiGrid />
      <TargetTracker />
      <ProactiveAlertCard />
      {/* Charts (Task 4) and campaign table (Task 5) slot in below this line */}
    </div>
  );
}
```

- [x] **Step 17: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

- [x] **Step 18: Manual checkpoint**

`npm run dev`, visit `http://localhost:3000/overview`. Confirm: sidebar shows Overview/Detail Platform/AI Insight + Billing/Settings/Connect Platform (no Support, no Pricing), business switcher shows "Toko Baju Sinta · Pro plan" and opens a dropdown on click, bell icon opens the activity feed dropdown anchored under it, 8 KPI cards render in 2 rows, target tracker shows ROAS/Closing progress bars, red-bordered proactive alert card is visible and mentions TikTok Ads 32%.

---

## Task 4: Overview — Channel performance chart + Trend chart (Recharts)

**Files:**
- Create: `src/features/overview-dashboard/components/ChannelChart.tsx`
- Create: `src/features/overview-dashboard/components/TrendChart.tsx`
- Modify: `src/features/overview-dashboard/mock-data.ts` (add chart series data)
- Modify: `src/app/(dashboard)/overview/page.tsx` (slot the two charts in side-by-side)
- Test: `src/features/overview-dashboard/components/__tests__/ChannelChart.test.tsx`, `TrendChart.test.tsx`

**Interfaces:**
- Consumes: `PLATFORMS` from `mock-data.ts` (Task 3).
- Produces: nothing new consumed by later tasks — this is a leaf UI feature.

- [x] **Step 1: Add chart series data to mock-data.ts**

Append to `src/features/overview-dashboard/mock-data.ts`:
```ts
export const CHANNEL_CHART_DATA = {
  spend: [
    { name: "Meta", value: 2400 },
    { name: "TikTok", value: 1400 },
  ],
  closing: [
    { name: "Meta", value: 40 },
    { name: "TikTok", value: 22 },
  ],
};

export const TREND_DATA: Record<7 | 30, { day: string; current: number; previous: number }[]> = {
  7: [
    { day: "1", current: 460, previous: 420 },
    { day: "2", current: 490, previous: 430 },
    { day: "3", current: 530, previous: 400 },
    { day: "4", current: 520, previous: 440 },
    { day: "5", current: 560, previous: 450 },
    { day: "6", current: 600, previous: 460 },
    { day: "7", current: 640, previous: 480 },
  ],
  30: [
    { day: "1", current: 1.9, previous: 1.5 },
    { day: "5", current: 2.1, previous: 1.6 },
    { day: "10", current: 2.2, previous: 1.7 },
    { day: "15", current: 2.5, previous: 1.9 },
    { day: "20", current: 2.8, previous: 2.1 },
    { day: "25", current: 3.3, previous: 2.2 },
    { day: "30", current: 3.8, previous: 2.4 },
  ],
};
```

- [x] **Step 2: Write the failing test for `ChannelChart`**

Create `src/features/overview-dashboard/components/__tests__/ChannelChart.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ChannelChart } from "../ChannelChart";

test("defaults to the Spend metric toggle active", () => {
  render(<ChannelChart />);
  expect(screen.getByRole("button", { name: "Spend" })).toHaveClass("bg-accent");
});

test("clicking Closing switches the active toggle", () => {
  render(<ChannelChart />);
  fireEvent.click(screen.getByRole("button", { name: "Closing" }));
  expect(screen.getByRole("button", { name: "Closing" })).toHaveClass("bg-accent");
  expect(screen.getByRole("button", { name: "Spend" })).not.toHaveClass("bg-accent");
});
```

- [x] **Step 3: Run to verify failure, then implement `ChannelChart`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- ChannelChart
```
Expected: FAIL.

Create `src/features/overview-dashboard/components/ChannelChart.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { CHANNEL_CHART_DATA } from "../mock-data";

export function ChannelChart() {
  const [metric, setMetric] = useState<"spend" | "closing">("spend");
  const data = CHANNEL_CHART_DATA[metric];

  return (
    <div className="rounded-2xl border border-line bg-card p-4.5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Channel performance</h3>
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
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid horizontal={false} stroke="#f0f0f4" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#9d9da6" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11.5, fill: "#6b6b76" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Bar dataKey="value" fill="#f0b400" radius={[0, 6, 6, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [x] **Step 4: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- ChannelChart
```
Expected: PASS, 2/2.

- [x] **Step 5: Write the failing test for `TrendChart`**

Create `src/features/overview-dashboard/components/__tests__/TrendChart.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TrendChart } from "../TrendChart";

test("defaults to 7 hari active and shows the legend", () => {
  render(<TrendChart />);
  expect(screen.getByRole("button", { name: "7 hari" })).toHaveClass("bg-accent");
  expect(screen.getByText("Spend (Sekarang)")).toBeInTheDocument();
  expect(screen.getByText("Spend (Sebelumnya)")).toBeInTheDocument();
});

test("clicking 30 hari switches the active toggle", () => {
  render(<TrendChart />);
  fireEvent.click(screen.getByRole("button", { name: "30 hari" }));
  expect(screen.getByRole("button", { name: "30 hari" })).toHaveClass("bg-accent");
});
```

- [x] **Step 6: Run to verify failure, then implement `TrendChart`**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- TrendChart
```
Expected: FAIL.

Create `src/features/overview-dashboard/components/TrendChart.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";
import { TREND_DATA } from "../mock-data";

export function TrendChart() {
  const [period, setPeriod] = useState<7 | 30>(7);
  const data = TREND_DATA[period];

  return (
    <div className="rounded-2xl border border-line bg-card p-4.5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Performance over time</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setPeriod(7)}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              period === 7 ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            7 hari
          </button>
          <button
            type="button"
            onClick={() => setPeriod(30)}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              period === 30 ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            30 hari
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9d9da6" }} axisLine={false} tickLine={false} />
          <Area type="monotone" dataKey="current" stroke="#f0b400" fill="#f0b400" fillOpacity={0.12} strokeWidth={2.4} />
          <Area
            type="monotone"
            dataKey="previous"
            stroke="#ffe08a"
            fill="transparent"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-3.5">
        <span className="flex items-center gap-1.5 text-[11px] text-ink-2">
          <i className="inline-block size-2.5 rounded-sm bg-[#f0b400]" />
          Spend (Sekarang)
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink-2">
          <i className="inline-block size-2.5 rounded-sm bg-[#ffe08a]" />
          Spend (Sebelumnya)
        </span>
      </div>
    </div>
  );
}
```

- [x] **Step 7: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- TrendChart
```
Expected: PASS, 2/2.

- [x] **Step 8: Slot both charts into the Overview page**

Modify `src/app/(dashboard)/overview/page.tsx` — add imports and render them side by side after `<ProactiveAlertCard />`:
```tsx
import { ChannelChart } from "@/features/overview-dashboard/components/ChannelChart";
import { TrendChart } from "@/features/overview-dashboard/components/TrendChart";
// ...
      <ProactiveAlertCard />
      <div className="mb-4 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <ChannelChart />
        <TrendChart />
      </div>
      {/* Campaign table (Task 5) slots in below this line */}
```

- [x] **Step 9: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

- [x] **Step 10: Manual checkpoint**

`npm run dev`, visit `/overview`. Confirm both charts render side by side, Channel performance toggles Spend/Closing bars, Performance over time toggles 7/30 hari and shows the two-line legend.

---

## Task 5: Overview — Campaign table (search + pagination) + campaign detail modal + set-target modal

**Files:**
- Modify: `src/features/overview-dashboard/mock-data.ts` (add `CAMPAIGNS`, `CREATIVES`, `STATUS_LABEL`, `formatRupiah`, `PAGE_SIZE`)
- Create: `src/features/overview-dashboard/components/CampaignTable.tsx`
- Create: `src/features/overview-dashboard/components/CampaignDetailModal.tsx`
- Create: `src/features/overview-dashboard/components/SetTargetModal.tsx`
- Modify: `src/features/overview-dashboard/components/TargetTracker.tsx` (wire in the Set Target modal trigger)
- Modify: `src/app/(dashboard)/overview/page.tsx`
- Test: `src/features/overview-dashboard/components/__tests__/CampaignTable.test.tsx`

**Interfaces:**
- Produces: nothing new consumed by later tasks — this closes out the Overview page for this plan.

- [x] **Step 1: Add campaign + creative mock data**

Append to `src/features/overview-dashboard/mock-data.ts`:
```ts
export type CampaignStatus = "active" | "paused" | "pending" | "archived";

export interface Campaign {
  name: string;
  status: CampaignStatus;
  channel: "Meta Ads" | "TikTok Ads";
  spend: number;
  ctr: string;
  conv: number;
  edited: string;
}

export const CAMPAIGNS: Campaign[] = [
  { name: "Summer Sale 2025", status: "active", channel: "Meta Ads", spend: 4250, ctr: "3.6%", conv: 123, edited: "09/12/2025" },
  { name: "Autumn Collection", status: "paused", channel: "Meta Ads", spend: 3420, ctr: "4.2%", conv: 87, edited: "08/12/2025" },
  { name: "Back-to-School Promo", status: "active", channel: "TikTok Ads", spend: 1980, ctr: "2.9%", conv: 121, edited: "09/12/2025" },
  { name: "Holiday Teaser Ads", status: "archived", channel: "TikTok Ads", spend: 1300, ctr: "1.7%", conv: 44, edited: "07/12/2025" },
  { name: "Retargeting Cart Abandon", status: "pending", channel: "Meta Ads", spend: 860, ctr: "4.2%", conv: 44, edited: "08/12/2025" },
  { name: "Product Launch Beta", status: "active", channel: "TikTok Ads", spend: 1760, ctr: "5.1%", conv: 87, edited: "07/12/2025" },
];

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  pending: "Pending Approval",
  archived: "Archived",
};

export function formatRupiah(nRibu: number): string {
  return "Rp" + (nRibu * 1000).toLocaleString("id-ID");
}

export interface Creative {
  name: string;
  ctr: string;
  status: "Winning" | "Fatigue" | "Baru";
}

export const CREATIVES: Record<string, Creative[]> = {
  "Summer Sale 2025": [
    { name: "Video Diskon 50% — 15 detik", ctr: "4.8%", status: "Winning" },
    { name: "Carousel Koleksi Musim Panas", ctr: "3.4%", status: "Winning" },
    { name: "Statis Harga Coret", ctr: "2.1%", status: "Fatigue" },
  ],
  "Autumn Collection": [
    { name: "Lookbook Autumn — Reels", ctr: "4.6%", status: "Winning" },
    { name: "Foto Produk Outdoor", ctr: "1.9%", status: "Fatigue" },
  ],
  "Back-to-School Promo": [
    { name: "UGC Testimoni Pelajar", ctr: "5.2%", status: "Winning" },
    { name: "Bundle Seragam — Statis", ctr: "2.4%", status: "Baru" },
    { name: "Video Unboxing 20 detik", ctr: "3.0%", status: "Baru" },
  ],
  "Product Launch Beta": [
    { name: "Teaser Produk Baru — 10 detik", ctr: "5.6%", status: "Winning" },
    { name: "Behind the Scene Produksi", ctr: "4.1%", status: "Baru" },
    { name: "Slideshow Fitur Produk", ctr: "2.2%", status: "Fatigue" },
  ],
};

export const PAGE_SIZE = 5;
```

- [x] **Step 2: Write the failing test for `CampaignTable`**

Create `src/features/overview-dashboard/components/__tests__/CampaignTable.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { CampaignTable } from "../CampaignTable";

test("renders the first page of 5 campaigns with a pager", () => {
  render(<CampaignTable />);
  expect(screen.getByText("Summer Sale 2025")).toBeInTheDocument();
  expect(screen.queryByText("Product Launch Beta")).not.toBeInTheDocument(); // page 2
  expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
});

test("search filters campaigns by name", () => {
  render(<CampaignTable />);
  fireEvent.change(screen.getByPlaceholderText("Cari campaign, channel…"), { target: { value: "Autumn" } });
  expect(screen.getByText("Autumn Collection")).toBeInTheDocument();
  expect(screen.queryByText("Summer Sale 2025")).not.toBeInTheDocument();
});

test("clicking a row opens the detail modal with creative performance", () => {
  render(<CampaignTable />);
  fireEvent.click(screen.getByText("Summer Sale 2025"));
  expect(screen.getByText("Creative Performance")).toBeInTheDocument();
  expect(screen.getByText("Video Diskon 50% — 15 detik")).toBeInTheDocument();
});
```

- [x] **Step 3: Run to verify failure**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- CampaignTable
```
Expected: FAIL.

- [x] **Step 4: Implement `CampaignDetailModal`**

Create `src/features/overview-dashboard/components/CampaignDetailModal.tsx`:
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CREATIVES, formatRupiah, type Campaign } from "../mock-data";

const CREA_BADGE: Record<string, "active" | "archived" | "pending"> = {
  Winning: "active",
  Fatigue: "archived",
  Baru: "pending",
};

export function CampaignDetailModal({
  campaign,
  onClose,
}: {
  campaign: Campaign | null;
  onClose: () => void;
}) {
  const creatives = campaign ? CREATIVES[campaign.name] ?? [] : [];

  return (
    <Dialog open={!!campaign} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{campaign?.name}</DialogTitle>
        </DialogHeader>
        {campaign && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg bg-bg p-2.5">
                <div className="text-[10.5px] text-ink-3">Spend</div>
                <div className="mt-0.5 text-[15px] font-extrabold">{formatRupiah(campaign.spend)}</div>
              </div>
              <div className="rounded-lg bg-bg p-2.5">
                <div className="text-[10.5px] text-ink-3">CTR</div>
                <div className="mt-0.5 text-[15px] font-extrabold">{campaign.ctr}</div>
              </div>
              <div className="rounded-lg bg-bg p-2.5">
                <div className="text-[10.5px] text-ink-3">Closing</div>
                <div className="mt-0.5 text-[15px] font-extrabold">{campaign.conv}</div>
              </div>
              <div className="rounded-lg bg-bg p-2.5">
                <div className="text-[10.5px] text-ink-3">Channel</div>
                <div className="mt-0.5 text-[15px] font-extrabold">{campaign.channel}</div>
              </div>
            </div>
            <div className="rounded-lg bg-accent-bg p-3 text-xs leading-relaxed text-accent-text">
              AI note: performa campaign ini masih dalam rentang normal — belum ada anomali terdeteksi.
            </div>
            <div className="border-t border-line-2 pt-3">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-2">Creative Performance</h4>
              {creatives.length === 0 ? (
                <div className="py-2.5 text-xs text-ink-3">Belum ada data creative untuk campaign ini.</div>
              ) : (
                creatives.map((cr) => (
                  <div key={cr.name} className="flex items-center gap-2.5 border-b border-line-2 py-2.5 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-semibold">{cr.name}</div>
                      <div className="mt-0.5 text-[11px] text-ink-3">CTR {cr.ctr}</div>
                    </div>
                    <Badge variant={CREA_BADGE[cr.status]}>{cr.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [x] **Step 5: Implement `CampaignTable`**

Create `src/features/overview-dashboard/components/CampaignTable.tsx`:
```tsx
"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CAMPAIGNS, PAGE_SIZE, STATUS_LABEL, formatRupiah, type Campaign, type CampaignStatus } from "../mock-data";
import { CampaignDetailModal } from "./CampaignDetailModal";

const STATUS_BADGE: Record<CampaignStatus, "active" | "paused" | "pending" | "archived"> = {
  active: "active",
  paused: "paused",
  pending: "pending",
  archived: "archived",
};

export function CampaignTable() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const filtered = useMemo(
    () =>
      CAMPAIGNS.filter(
        (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.channel.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[180px] flex-1 items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2">
          <Search className="size-4 text-ink-3" />
          <input
            placeholder="Cari campaign, channel…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-xs text-ink outline-none"
          />
        </div>
        <Button variant="ghost">Save View</Button>
        <Button variant="ghost">Filters</Button>
      </div>

      <div className="rounded-2xl border border-line bg-card p-4.5">
        <h3 className="mb-3.5 text-sm font-bold">All campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Campaign</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Status</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Channel</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Spend</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">CTR</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Closing</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-ink-3">
                    Tidak ada campaign yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr
                    key={c.name}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer border-b border-line-2 last:border-b-0 hover:bg-bg"
                  >
                    <td className="px-2 py-3 text-xs">{c.name}</td>
                    <td className="px-2 py-3">
                      <Badge variant={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="px-2 py-3 text-xs text-ink-2 underline decoration-line underline-offset-2">
                      {c.channel}
                    </td>
                    <td className="px-2 py-3 text-right text-xs">{formatRupiah(c.spend)}</td>
                    <td className="px-2 py-3 text-right text-xs">{c.ctr}</td>
                    <td className="px-2 py-3 text-right text-xs">{c.conv}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3.5 flex items-center justify-end gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`size-7.5 rounded-lg border text-[12.5px] ${
                p === currentPage ? "border-accent bg-accent text-ink" : "border-line bg-card text-ink-2"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <CampaignDetailModal campaign={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
```

- [x] **Step 6: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- CampaignTable
```
Expected: PASS, 3/3.

- [x] **Step 7: Implement `SetTargetModal`** (no dedicated test — thin form wrapper over already-tested `TargetTracker` data shape; covered by the manual checkpoint)

Create `src/features/overview-dashboard/components/SetTargetModal.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TARGETS } from "../mock-data";

export function SetTargetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [roas, setRoas] = useState(String(TARGETS.roas));
  const [closing, setClosing] = useState(String(TARGETS.closing));

  function handleSave() {
    const r = parseFloat(roas);
    const c = parseInt(closing, 10);
    if (isNaN(r) || r <= 0 || isNaN(c) || c <= 0) return;
    // Task 3's TARGETS is a plain object for this UI-only phase — real persistence
    // (Firestore) is wired in the later data-layer plan, not here.
    TARGETS.roas = r;
    TARGETS.closing = c;
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set target bulan ini</DialogTitle>
        </DialogHeader>
        <div className="mb-3.5 text-xs leading-relaxed text-ink-2">
          Target dipakai buat ngukur progres di dashboard. Bisa diubah kapan saja.
        </div>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold text-ink-2">Target ROAS (x)</span>
          <input
            type="number"
            step="0.1"
            value={roas}
            onChange={(e) => setRoas(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-semibold text-ink-2">Target Closing (transaksi)</span>
          <input
            type="number"
            step="1"
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
        </label>
        <div className="flex gap-2">
          <Button className="flex-1 justify-center" onClick={handleSave}>
            Simpan target
          </Button>
          <Button variant="ghost" className="flex-1 justify-center" onClick={onClose}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [x] **Step 8: Wire `SetTargetModal` into `TargetTracker` and slot `CampaignTable` into the Overview page**

Modify `src/features/overview-dashboard/components/TargetTracker.tsx` — add the modal trigger button and state:
```tsx
"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TARGETS, ACTUALS } from "../mock-data";
import { SetTargetModal } from "./SetTargetModal";

// ...keep the existing Row/ROWS definitions...

export function TargetTracker() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-4.5">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">Target Bulan Ini</h3>
          <div className="mt-0.5 text-[11.5px] text-ink-3">Progres aktual dibanding target yang kamu set.</div>
        </div>
        <Button variant="ghost" onClick={() => setModalOpen(true)}>
          Set target
        </Button>
      </div>
      {/* ...keep the existing ROWS.map(...) block unchanged... */}
      <SetTargetModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
```
(Note: this changes `TargetTracker` from a Server Component to a Client Component via `"use client"` — required since it now holds `useState`. Its existing test from Task 3 still passes unmodified since it doesn't test client/server boundaries.)

Modify `src/app/(dashboard)/overview/page.tsx` — add the campaign table below the charts:
```tsx
import { CampaignTable } from "@/features/overview-dashboard/components/CampaignTable";
// ...
      <div className="mb-4 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <ChannelChart />
        <TrendChart />
      </div>
      <CampaignTable />
```

- [x] **Step 9: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

- [x] **Step 10: Manual checkpoint**

`npm run dev`, visit `/overview`. Confirm: campaign table shows 5 of 6 campaigns with a page-2 button, search narrows results live, clicking a row opens the detail modal with 4 stat tiles + creative performance list, "Set target" button opens the target modal and saving updates the progress bars without a page reload.

---

## Self-Review Notes

**Spec coverage:** `03-overview-dashboard.md`'s checklist items are covered: 8 KPI (2 rows) ✓, coverage banner ✓ (static for now, dynamic once Wave 2 wires real connection state), Last Synced text ✓ (static — Sync button behavior itself is deferred to the data-wiring plan since "sync" implies a real refetch), Proactive Alert Card conditional on real logic ✓, Channel + Trend charts ✓, search + pagination ✓. Sync button and "Copy as report" export are intentionally NOT in this plan — they need either a data-refetch story (Sync) or `html2canvas` (export), both belonging to the later data-wiring/export plans; the Overview page in this plan omits those two header buttons rather than faking them, and that omission is called out here rather than silently dropped.

**Deferred to later plans (explicitly, not silently):** Sync button + Last Synced live timestamp, "Copy as report" export, real coverage-banner data (currently hardcoded `2 dari 2`), Detail Platform page, AI Insight page, Billing/Settings/Connect Platform pages, and all real Firebase/Firestore wiring for everything built here.
