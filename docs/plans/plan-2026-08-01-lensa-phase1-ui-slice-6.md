# Lensa — Phase 1 UI Slice 6: Connect Platform (in-dashboard) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the mockup's in-dashboard Connect Platform page into `/connect-platform` — a list of platforms (Meta Ads, TikTok Ads) showing connection + sync-health status, with a "Reconnect" action for a platform whose sync is failing. This is distinct from the onboarding version (`/onboarding`, Slice 2) — that one is the first-run connect flow; this one is the always-available "manage your connections" page reachable from the sidebar at any time, matching `01-connect-platform-onboarding.md`'s note that users can "nambah platform lain kapan saja lewat menu Connect Platform di dalam dashboard."

**Architecture:** One route `src/app/(dashboard)/connect-platform/page.tsx`, reusing the visual `connect-row` pattern already established in Onboarding (Slice 2) but extended with a sync-status line and reconnect button, matching the mockup's `renderSyncHealth()` behavior. Local mock sync state (not persisted, not shared with any other page) — same UI-only phase as everything else.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind v3, Vitest + RTL with fake timers.

## Global Constraints

- **No Firebase/Firestore calls anywhere in this plan.**
- Accent color = amber/gold, this project's existing Tailwind tokens.
- Max 2 Zustand stores (`ui`+`auth`) — sync/reconnect state is component-local `useState`.
- If any Tailwind class uses a fractional spacing value outside Tailwind v3's default scale (`4.5`/`6.5`/`7.5`/`15` are NOT valid; `0.5`/`1.5`/`2.5`/`3.5` ARE), substitute the nearest valid key and note it. This plan's code was written avoiding the invalid ones; still double-check.
- No git repository in the parent `Assessment/` folder — every "commit" step is a manual checkpoint instead.
- When testing a component with `setTimeout` + local state via fake timers, wrap both the triggering click and the timer advance in `act()` from `"react"`.

---

## Task 1: Connect Platform page (list + sync health + reconnect)

**Files:**
- Create: `src/features/connect-platform/mock-data.ts`
- Create: `src/features/connect-platform/components/PlatformConnectionList.tsx`
- Create: `src/app/(dashboard)/connect-platform/page.tsx`
- Test: `src/features/connect-platform/components/__tests__/PlatformConnectionList.test.tsx`

**Interfaces:**
- Produces: nothing consumed elsewhere — this is the final page of this UI-slicing round.

- [x] **Step 1: Write the mock connection-status data**

Create `src/features/connect-platform/mock-data.ts`:
```ts
export interface PlatformConnection {
  key: "meta" | "tiktok";
  name: string;
  sub: string;
  ic: string;
  syncStatus: "ok" | "error";
  lastSync: string;
}

export const PLATFORM_CONNECTIONS: PlatformConnection[] = [
  { key: "meta", name: "Meta Ads", sub: "Facebook & Instagram Ads", ic: "M", syncStatus: "ok", lastSync: "12 menit lalu" },
  { key: "tiktok", name: "TikTok Ads", sub: "TikTok for Business", ic: "TT", syncStatus: "error", lastSync: "2 jam lalu" },
];
```

- [x] **Step 2: Write the failing tests**

Create `src/features/connect-platform/components/__tests__/PlatformConnectionList.test.tsx`:
```tsx
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { PlatformConnectionList } from "../PlatformConnectionList";

test("renders both platforms as connected with sync status text", () => {
  render(<PlatformConnectionList />);
  expect(screen.getByText("Meta Ads")).toBeInTheDocument();
  expect(screen.getByText(/Terakhir sync: 12 menit lalu/)).toBeInTheDocument();
  expect(screen.getByText("TikTok Ads")).toBeInTheDocument();
  expect(screen.getByText(/Gagal sync sejak 2 jam lalu/)).toBeInTheDocument();
});

test("shows a Reconnect button only for the platform with a sync error", () => {
  render(<PlatformConnectionList />);
  expect(screen.getAllByRole("button", { name: "Reconnect" })).toHaveLength(1);
});

test("clicking Reconnect shows a connecting state then resolves to synced", () => {
  vi.useFakeTimers();
  render(<PlatformConnectionList />);
  act(() => {
    screen.getByRole("button", { name: "Reconnect" }).click();
  });
  expect(screen.getByText(/Menyambungkan ulang/)).toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(1400);
  });
  expect(screen.getByText(/Terakhir sync: baru saja/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Reconnect" })).not.toBeInTheDocument();
  vi.useRealTimers();
});
```

- [x] **Step 3: Run to verify failure**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformConnectionList
```
Expected: FAIL (module not found).

- [x] **Step 4: Implement `PlatformConnectionList`**

Create `src/features/connect-platform/components/PlatformConnectionList.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_CONNECTIONS, type PlatformConnection } from "../mock-data";

export function PlatformConnectionList() {
  const [connections, setConnections] = useState<PlatformConnection[]>(PLATFORM_CONNECTIONS);
  const [reconnecting, setReconnecting] = useState<string | null>(null);

  function reconnect(key: string) {
    setReconnecting(key);
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) => (c.key === key ? { ...c, syncStatus: "ok", lastSync: "baru saja" } : c))
      );
      setReconnecting(null);
    }, 1400);
  }

  return (
    <div className="flex max-w-[480px] flex-col gap-2.5">
      {connections.map((c) => {
        const isReconnecting = reconnecting === c.key;
        return (
          <div key={c.key} className="rounded-xl border-2 border-green bg-green-bg p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green text-[11.5px] font-bold text-white">
                {c.ic}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold">{c.name}</div>
                <div className="mt-0.5 text-[11.5px] text-ink-3">{c.sub}</div>
              </div>
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-green bg-green">
                <Check className="size-3.5 text-white" />
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
              {isReconnecting ? (
                <span className="flex items-center gap-1.5 text-ink-3">
                  <span className="size-3 animate-spin rounded-full border-2 border-line border-t-accent" />
                  Menyambungkan ulang…
                </span>
              ) : c.syncStatus === "error" ? (
                <>
                  <span className="font-semibold text-red">Gagal sync sejak {c.lastSync}</span>
                  <Button
                    variant="destructive"
                    className="px-2.5 py-1 text-[10.5px]"
                    onClick={() => reconnect(c.key)}
                  >
                    Reconnect
                  </Button>
                </>
              ) : (
                <span className="text-ink-3">Terakhir sync: {c.lastSync}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```
Note: no fractional Tailwind values in this file fall outside the established valid set (`2.5`/`1.5`/`3.5` are all valid).

- [x] **Step 5: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- PlatformConnectionList
```
Expected: PASS, 3/3.

- [x] **Step 6: Assemble the Connect Platform page**

Create `src/app/(dashboard)/connect-platform/page.tsx`:
```tsx
import { PlatformConnectionList } from "@/features/connect-platform/components/PlatformConnectionList";

export default function ConnectPlatformPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[23px] font-extrabold tracking-tight">Connect Platform</h1>
        <div className="mt-0.5 text-xs text-ink-3">
          Plan Pro — Meta Ads &amp; TikTok Ads terhubung otomatis sebagai platform inti
        </div>
      </div>
      <PlatformConnectionList />
    </div>
  );
}
```

- [x] **Step 7: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass.

- [x] **Step 8: Manual checkpoint**

`npm run dev`, visit `/connect-platform`. Confirm: both platforms show as connected (green), Meta shows "Terakhir sync: 12 menit lalu", TikTok shows a red "Gagal sync sejak 2 jam lalu" message plus a "Reconnect" button; clicking Reconnect shows a spinner (~1.4s) then flips TikTok to the healthy synced state with the Reconnect button gone.

---

## Self-Review Notes

**Spec coverage:** this closes out all remaining Phase 1 UI pages. Distinguishing this page from Onboarding (Slice 2) is deliberate — matches `01-connect-platform-onboarding.md`'s own note that the in-dashboard Connect Platform menu is for adding/managing platforms "kapan saja" after first-run onboarding, a different UX moment with different content (sync health, reconnect) than the first-time connect flow. **Not built**: adding new platforms to the catalog (Google Analytics, Marketplace Ads) — still deferred per `PROGRESS.md`, since the catalog itself is still only Meta+TikTok everywhere in this project.
