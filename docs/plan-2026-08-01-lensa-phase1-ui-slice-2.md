# Lensa — Phase 1 UI Slice 2: Sign In + Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the mockup's `stage-signin` and `stage-onboarding` screens into real Next.js pages, wired together with client-side navigation so the app has a full front door: `/` (Sign In) → `/onboarding` (connect platform simulation) → `/overview` (already built in UI Slice 1). Still **no Firebase/Firestore** — this is the same UI-only phase as Slice 1, just extended to the two pages that come before the dashboard. Real auth/session wiring is a separate, later plan (tomorrow, per the user).

**Architecture:** Two new pages sitting outside the `(dashboard)` route group (so they render without the sidebar/topbar shell, matching the mockup's centered auth/onboarding layout). Both replicate the mockup's exact simulated timing (`setTimeout` for "loading"/"connecting") using local `useState`, then use `next/navigation`'s `useRouter().push(...)` to move to the next screen. `src/app/page.tsx` (currently the untouched `create-next-app` starter) is replaced by the Sign In page.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind v3 (existing tokens), Vitest + React Testing Library with fake timers.

## Global Constraints

- **No Firebase/Firestore calls anywhere in this plan.** Sign-in doesn't validate credentials against anything real; onboarding doesn't write connection state anywhere persistent. Both are decorative simulations matching the HTML mockup's own behavior, exactly like UI Slice 1's Overview page was.
- Accent color = amber/gold (`bg-accent`/`text-ink`/etc., this project's existing Tailwind tokens) — never hardcoded hex.
- Max 2 Zustand stores total (`ui`+`auth`, already exist) — do not add new stores; both pages use component-local `useState` only.
- If any Tailwind class in this plan's code uses a fractional spacing value outside Tailwind v3's default scale (established pattern this project has hit repeatedly: `4.5`/`6.5`/`15`/`7.5` aren't in the default scale, but `0.5`/`1.5`/`2.5`/`3.5` are), substitute the nearest valid v3 scale value and note it in the report — not a blocker.
- No git repository in the parent `Assessment/` folder — every "commit" step is a manual checkpoint instead. The nested git repo inside `lensa-app/` exists and may be used for local diffing if useful.
- When testing components that use `setTimeout` + local state together with fake timers, wrap timer advances in `act()` from `react` (not bare `vi.advanceTimersByTime` followed by a synchronous assertion) to avoid flaky "not wrapped in act()" warnings or stale-DOM assertions — the task briefs below specify this pattern explicitly.

---

## File Structure

- Modify: `src/app/page.tsx` — replaced entirely (currently the unused `create-next-app` starter template).
- Create: `src/app/page.tsx`'s test at `src/app/__tests__/page.test.tsx`.
- Create: `src/app/onboarding/page.tsx`.
- Create: `src/app/onboarding/__tests__/page.test.tsx`.

---

## Task 1: Sign In page (`/`)

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/__tests__/page.test.tsx`

**Interfaces:**
- Produces: nothing consumed by later tasks in this plan — Task 2 is a separate page reached only by navigation, not by import.

- [x] **Step 1: Write the failing test**

Create `src/app/__tests__/page.test.tsx`:
```tsx
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import SignInPage from "../page";

test("renders the sign-in form with prefilled demo credentials", () => {
  render(<SignInPage />);
  expect(screen.getByText("Masuk ke Lensa")).toBeInTheDocument();
  expect(screen.getByLabelText("Email")).toHaveValue("sinta@tokobaju.com");
  expect(screen.getByLabelText("Password")).toHaveValue("lensa123");
});

test("clicking Masuk shows a loading state, then navigates to /onboarding", () => {
  vi.useFakeTimers();
  render(<SignInPage />);
  const btn = screen.getByRole("button", { name: "Masuk" });
  act(() => {
    btn.click();
  });
  expect(btn).toBeDisabled();
  act(() => {
    vi.advanceTimersByTime(900);
  });
  expect(pushMock).toHaveBeenCalledWith("/onboarding");
  vi.useRealTimers();
});
```

- [x] **Step 2: Run to verify failure**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- app/__tests__/page
```
Expected: FAIL — either the test file can't find named exports it expects, or assertions fail against the current default `create-next-app` starter content (which has none of "Masuk ke Lensa", no email/password fields).

- [x] **Step 3: Implement the Sign In page**

Replace the entire contents of `src/app/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSignIn() {
    setLoading(true);
    setTimeout(() => {
      router.push("/onboarding");
    }, 900);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-[360px] text-center">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-ink">
          L
        </div>
        <h2 className="mb-1 text-[19px] font-extrabold">Masuk ke Lensa</h2>
        <p className="mb-6 text-xs text-ink-3">Lihat performa iklan semua platform dalam satu tempat.</p>

        <div className="mb-3 text-left">
          <label htmlFor="signin-email" className="mb-1 block text-xs font-semibold text-ink-2">
            Email
          </label>
          <input
            id="signin-email"
            type="text"
            defaultValue="sinta@tokobaju.com"
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
        </div>
        <div className="mb-3 text-left">
          <label htmlFor="signin-password" className="mb-1 block text-xs font-semibold text-ink-2">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            defaultValue="lensa123"
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
        </div>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[12.5px] font-bold text-ink disabled:opacity-45"
        >
          {loading ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-ink/35 border-t-ink" />
          ) : (
            "Masuk"
          )}
        </button>
        <div className="mt-4 text-xs text-ink-3">
          Belum punya akun? <b>Daftar</b> · Lupa password?
        </div>
      </div>
    </div>
  );
}
```
Note: the loading button shows a spinner in place of the "Masuk" label rather than alongside it (matching the mockup's `.lbl`/`.spin` toggle) — the test asserts `toBeDisabled()` during loading, not the button's accessible name, so this doesn't break Step 1's test.

- [x] **Step 4: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- app/__tests__/page
```
Expected: PASS, 2/2.

- [x] **Step 5: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass. Note: `npm run build` will now show `/` as a real route with actual content instead of the default starter.

---

## Task 2: Onboarding page (`/onboarding`)

**Files:**
- Create: `src/app/onboarding/page.tsx`
- Create: `src/app/onboarding/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: nothing from Task 1 (reached only via navigation, not import).
- Produces: nothing consumed elsewhere in this plan — `/overview` (built in UI Slice 1) is the navigation target, referenced only as a route string `"/overview"`, not an import.

- [x] **Step 1: Write the failing tests**

Create `src/app/onboarding/__tests__/page.test.tsx`:
```tsx
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import OnboardingPage from "../page";

test("continue button is disabled until a platform connects", () => {
  render(<OnboardingPage />);
  expect(screen.getByRole("button", { name: "Lanjut ke dashboard" })).toBeDisabled();
});

test("clicking a platform row connects it after a delay and enables continue", () => {
  vi.useFakeTimers();
  render(<OnboardingPage />);
  act(() => {
    screen.getByText("Meta Ads").closest("button")!.click();
  });
  act(() => {
    vi.advanceTimersByTime(1100);
  });
  expect(screen.getByRole("button", { name: "Lanjut ke dashboard" })).not.toBeDisabled();
  vi.useRealTimers();
});

test("clicking continue navigates to /overview", () => {
  vi.useFakeTimers();
  render(<OnboardingPage />);
  act(() => {
    screen.getByText("Meta Ads").closest("button")!.click();
  });
  act(() => {
    vi.advanceTimersByTime(1100);
  });
  act(() => {
    screen.getByRole("button", { name: "Lanjut ke dashboard" }).click();
  });
  expect(pushMock).toHaveBeenCalledWith("/overview");
  vi.useRealTimers();
});
```

- [x] **Step 2: Run to verify failure**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- onboarding/__tests__/page
```
Expected: FAIL — `Failed to resolve import "../page"` (route doesn't exist yet).

- [x] **Step 3: Implement the Onboarding page**

Create `src/app/onboarding/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const PLATFORMS = [
  { key: "meta", name: "Meta Ads", sub: "Facebook & Instagram Ads", ic: "M" },
  { key: "tiktok", name: "TikTok Ads", sub: "TikTok for Business", ic: "TT" },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

export default function OnboardingPage() {
  const [connected, setConnected] = useState<Record<PlatformKey, boolean>>({ meta: false, tiktok: false });
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const router = useRouter();

  function connect(key: PlatformKey) {
    if (connected[key] || connecting) return;
    setConnecting(key);
    setTimeout(() => {
      setConnected((prev) => ({ ...prev, [key]: true }));
      setConnecting(null);
    }, 1100);
  }

  const anyConnected = connected.meta || connected.tiktok;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-ink">
        L
      </div>
      <h2 className="mb-1.5 text-[19px] font-extrabold">Halo, Sinta — hubungkan platform iklanmu</h2>
      <p className="mb-6 max-w-[400px] text-[13px] text-ink-3">
        Sesuai plan Pro, kamu bisa hubungkan Meta Ads &amp; TikTok Ads sebagai platform inti. Klik salah satu buat
        mulai.
      </p>

      <div className="mb-5 flex w-full max-w-[420px] flex-col gap-2.5 text-left">
        {PLATFORMS.map((p) => {
          const isDone = connected[p.key];
          const isConnecting = connecting === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => connect(p.key)}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                isDone ? "border-2 border-green bg-green-bg" : "border-line bg-card hover:border-accent"
              }`}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[11.5px] font-bold ${
                  isDone ? "bg-green text-white" : "bg-gray-bg text-ink-2"
                }`}
              >
                {p.ic}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold">{p.name}</div>
                <div className="mt-0.5 text-[11.5px] text-ink-3">{p.sub}</div>
              </div>
              {isConnecting ? (
                <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
              ) : (
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    isDone ? "border-green bg-green" : "border-line"
                  }`}
                >
                  {isDone && <Check className="size-3.5 text-white" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mb-5 text-xs text-ink-3">
        Plan Pro — hubungkan minimal 1 platform buat lanjut, bisa tambah platform lain kapan saja
      </div>

      <button
        type="button"
        disabled={!anyConnected}
        onClick={() => router.push("/overview")}
        className="rounded-lg bg-accent px-5 py-2.5 text-[12.5px] font-bold text-ink disabled:opacity-45"
      >
        Lanjut ke dashboard
      </button>
    </div>
  );
}
```

- [x] **Step 4: Run to verify pass**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test -- onboarding/__tests__/page
```
Expected: PASS, 3/3.

- [x] **Step 5: Full verification**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npm run test && npx tsc --noEmit && npm run build
```
Expected: all pass. `npm run build`'s route list should now show `/`, `/onboarding`, and `/overview` as three real static routes.

- [x] **Step 6: Manual checkpoint**

`npm run dev`, visit `http://localhost:3000/`. Confirm: Sign In form shows prefilled demo credentials, clicking "Masuk" shows a spinner then lands on `/onboarding` after ~900ms. On Onboarding: "Lanjut ke dashboard" starts disabled, clicking a platform row shows a spinner then turns it green with a checkmark, button enables after connecting at least one, clicking it lands on `/overview`.

---

## Self-Review Notes

**Spec coverage:** `00-auth-flow.md`'s "must exist and be functional" requirement is **not** met by this plan on purpose — this slice is decorative/UI-only, matching the same "UI first, wire logic later" sequencing already used for Overview in UI Slice 1. Real Firebase Auth (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, Zod validation, Firestore user/business doc creation) and `01-connect-platform-onboarding.md`'s Firestore-backed `connectedPlatforms` persistence are both explicitly deferred to the next plan (tomorrow, per the user), not silently skipped.

**Deferred, not forgotten:**
- Real auth (sign-up form, forgot-password, Firebase Auth calls, Zod validation, redirect-based-on-real-session-state).
- Connect Platform onboarding's actual Firestore write (currently the "connected" state lives only in the Onboarding page's local `useState` and is thrown away on navigation — it has no effect on the Overview page's `CoverageBanner`, which still shows its own static mock numbers from UI Slice 1).
- Toast notifications on successful connect (mockup has these; skipped here to keep tonight's scope to the two pages + navigation, no shared toast system exists yet).
- Error/retry state for a failed connect attempt (`01-connect-platform-onboarding.md`'s checklist item) — not built.
