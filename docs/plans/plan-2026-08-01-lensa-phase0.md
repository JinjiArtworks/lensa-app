# Lensa — Prototype Finalization & Phase 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the last known gaps in the HTML/JS prototype (`lensa-dashboard-full-interactive_1.html`) against its own documented checklists, then stand up the real Next.js 14 + Firebase project (`implementation-phases.md` Phase 0) so actual feature development can begin on solid ground.

**Architecture:** Two parts. **Part A** patches the existing single-file static mockup in place — no build step, no framework, verified with the same `node --check` (inline `<script>` syntax) + Python `html.parser` (tag-balance / `getElementById` cross-reference) commands used throughout this project's mockup work. **Part B** scaffolds a brand-new Next.js 14 App Router project from scratch per `business-plan.md` §7, wires up the design tokens finalized in `design-system.md`, and gets testing infra (Vitest) running before any feature code is written. **Part C** is not implemented here — it's a roadmap pointer to Phase 1–4, deliberately left unexploded until Phase 0 exists and real file/component boundaries can be decided (writing bite-sized code-level tasks for pages that don't exist yet would just be invented guesswork).

**Tech Stack:** Mockup (Part A): vanilla HTML/CSS/JS + Chart.js — unchanged. Real app (Part B): Next.js 14 App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Zustand (`ui` + `auth` stores only), TanStack Query v5, Zod, Recharts, Framer Motion, Firebase (Auth/Firestore/Hosting), Vitest + React Testing Library + MSW.

## Global Constraints

- **No git repository exists** in this project directory — every "commit" step below is replaced with a manual checkpoint (verify output, move on). Do not run `git init` unless the user asks.
- Mockup file is `lensa-dashboard-full-interactive_1.html` (single file, no build tooling) — verify every change with the two commands defined in Task 1 Step 2, not a test framework.
- Free tier = 1 bisnis, **1 platform** (Meta Ads *atau* TikTok Ads), 1 user, AI Insight dasar (kategori Positif saja), histori 7 hari, no export/multi-bisnis — per `business-plan.md` §3.
- Accent color = **amber/gold** `#f0b400` / `#fff6d6` / `#8a6400` — per `design-system.md`. Never purple/`#6d5ef0` (superseded draft).
- **Ticket/Support System** and **Compare 2 Platform** are OUT OF SCOPE — do not rebuild either, per `business-plan.md` §9.
- AI Insight, ads data, and Billing/payment stay mock/simulated — never wire to a live API/gateway without a separately confirmed decision (`AGENTS.md` §4).
- Auth tokens: in-memory (Zustand `auth` store) only, never `localStorage` (`00-auth-flow.md`).
- Max 2 Zustand stores in the real app (`ui` + `auth`) — resist adding more per store per feature.
- `31-frontend-nextjs.md` and `00-engineering-standard.md`, referenced by `AGENTS.md`/`lensa-fe-builder.md`, **do not exist in this repo**. Part B Task 5 defines a minimal folder convention inline instead of assuming that external doc's content.

---

## Part A — Prototype Finalization (mockup fixes)

Two gaps identified against the mockup's own feature checklists. Everything else found during review (Google Analytics/Marketplace Ads catalog, Billing footer disclaimer, real `html2canvas` export, connect-failure error state, Business Switcher free-tier gate) is a **conscious, documented deferral** — not a bug — see Decisions Log at the end of this file. Do not build those as part of this plan.

### Task 1: Onboarding actually demonstrates the connect flow

**Why:** `01-connect-platform-onboarding.md` calls this "titik UX paling krusial, first impression" and its checklist requires the connect animation (spinner → green checklist → toast) and a disabled "Lanjut ke dashboard" button until ≥1 platform connects. Currently both rows start pre-marked `done` and the continue button has no `disabled` attribute, so the flow the spec cares about most never actually triggers during a normal walkthrough.

**Files:**
- Modify: `lensa-dashboard-full-interactive_1.html` (single file)
  - Lines ~338–358 (`#stage-onboarding` markup)
  - Line ~963 (`var CONNECT_STATE = { meta:true, tiktok:true };`)

**Interfaces:**
- Consumes: existing `connectPlatform(key)`, `checkContinue()`, `updateCoverage()` — unchanged, already correct once `CONNECT_STATE` starts `false`.
- Produces: nothing new is consumed by later tasks; this is a self-contained fix.

- [x] **Step 1: Read the current onboarding block to confirm line numbers haven't drifted**

Run:
```bash
grep -n "stage-onboarding\|connect-row done\|continueBtn\|quota-note\|CONNECT_STATE = " "lensa-dashboard-full-interactive_1.html"
```
Expected: matches around lines 338, 344, 350, 357, 358, 963 (as recorded above). If line numbers differ, re-read that range with the Read tool before editing — do not blind-edit by line number.

- [x] **Step 2: Remove `done` from the two onboarding rows and disable the continue button**

Change (inside `#stage-onboarding` only — do **not** touch the matching rows inside `#page-connect`, which correctly stay `done` since by then the user really is connected):

```html
<!-- before -->
<div class="connect-row done" data-platform="meta" onclick="connectPlatform('meta')">
...
<div class="connect-row done" data-platform="tiktok" onclick="connectPlatform('tiktok')">
...
<div class="quota-note" style="margin-bottom:20px;">Plan Pro aktif — 2 platform inti sudah terhubung otomatis</div>
<button class="btn-primary" id="continueBtn" style="max-width:220px;" onclick="goDashboardStage()"><span class="lbl">Lanjut ke dashboard</span><span class="spin"></span></button>
```

```html
<!-- after -->
<div class="connect-row" data-platform="meta" onclick="connectPlatform('meta')">
...
<div class="connect-row" data-platform="tiktok" onclick="connectPlatform('tiktok')">
...
<div class="quota-note" style="margin-bottom:20px;">Plan Pro — hubungkan minimal 1 platform buat lanjut, bisa tambah platform lain kapan saja</div>
<button class="btn-primary" id="continueBtn" style="max-width:220px;" onclick="goDashboardStage()" disabled><span class="lbl">Lanjut ke dashboard</span><span class="spin"></span></button>
```

- [x] **Step 3: Flip the initial `CONNECT_STATE` to unconnected**

```js
// before
var CONNECT_STATE = { meta:true, tiktok:true };

// after
var CONNECT_STATE = { meta:false, tiktok:false };
```

- [x] **Step 4: Verify JS still parses and no stale references broke**

Run:
```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment" && python3 -c "
import re
content = open('lensa-dashboard-full-interactive_1.html').read()
m = re.search(r'<script>(.*)</script>', content, re.S)
open('/tmp/_planA1.js','w').write(m.group(1))
"
node --check /tmp/_planA1.js && echo "JS OK"
rm -f /tmp/_planA1.js
```
Expected: `JS OK` with no errors.

- [x] **Step 5: Verify HTML tag balance + every `getElementById` target still exists**

Run:
```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment" && python3 << 'EOF'
import re
from html.parser import HTMLParser
content = open('lensa-dashboard-full-interactive_1.html').read()
content_no_js = re.sub(r'(<script[^>]*>)(.*?)(</script>)', r'\1\3', content, flags=re.S)
VOID = {'meta','link','input','br','img','hr','area','base','col','embed','source','track','wbr'}
class Checker(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.errors=[]
    def handle_starttag(self,tag,attrs):
        if tag in VOID: return
        self.stack.append((tag,self.getpos()))
    def handle_endtag(self,tag):
        if tag in VOID: return
        if not self.stack: self.errors.append(f"extra </{tag}>"); return
        top,pos=self.stack[-1]
        if top==tag: self.stack.pop()
        else:
            for i in range(len(self.stack)-1,-1,-1):
                if self.stack[i][0]==tag:
                    for u in self.stack[i+1:]: self.errors.append(f"unclosed <{u[0]}> at {u[1]}")
                    self.stack=self.stack[:i]; break
            else: self.errors.append(f"mismatched </{tag}> at {self.getpos()}")
c=Checker(); c.feed(content_no_js)
print("open:",c.stack); print("errors:",c.errors)
ids_defined = set(re.findall(r'id="([^"]+)"', content))
used_ids = {m[1] for m in re.findall(r"getElementById\((['\"])([^'\"]+)\1\)", content)}
print("missing ids:", used_ids - ids_defined)
EOF
```
Expected: `open: []`, `errors: []`, `missing ids: set()`.

- [x] **Step 6: Manual checkpoint (no git repo — just confirm and move on)**

Open the file in a browser, click "Masuk" on sign-in, and confirm: onboarding shows both rows as NOT connected, "Lanjut ke dashboard" is greyed out/disabled, clicking a row shows the spinner then green checkmark + toast, and the button enables after the first successful connect.

---

### Task 2: Proactive Alert Card becomes conditional, not hardcoded

**Why:** `03-overview-dashboard.md` checklist requires: *"Proactive Alert Card muncul kondisional (ada logic trigger, bukan selalu tampil)."* The card is currently a plain, unconditional `<div>` in the Overview page — it always renders regardless of any data condition, which fails this checklist item as written (a reviewer checking the code would find no trigger logic at all).

**Files:**
- Modify: `lensa-dashboard-full-interactive_1.html` (single file)
  - Overview page markup, the alert `<div class="panel" style="border-left:4px solid var(--red);...">` block (currently ~line 485)
  - JS: add `parsePct()` and `renderProactiveAlert()` near the other `render*()` functions, and one call at the bottom init block alongside `renderTargets(); renderBenchmark();` etc.

**Interfaces:**
- Consumes: `PLATFORMS.tiktok.metrics.Spend.sub` and `PLATFORMS.tiktok.metrics.Closing.sub` — existing strings like `'▲ 32% vs periode lalu'` (already defined in the `PLATFORMS` object from earlier work this session).
- Produces: `renderProactiveAlert()` — no other task depends on it, but any future task that changes `PLATFORMS.tiktok.metrics` values should re-run this function if it wants the banner to react.

- [x] **Step 1: Confirm current markup line**

Run:
```bash
grep -n 'border-left:4px solid var(--red)' "lensa-dashboard-full-interactive_1.html"
```
Expected: one match, the Overview alert panel. Read 5 lines around it with the Read tool to get the exact current text before editing (it may have shifted from line 485 after Task 1's edits).

- [x] **Step 2: Give the alert panel an id and a default-hidden class**

```html
<!-- before -->
<div class="panel" style="border-left:4px solid var(--red);display:flex;align-items:center;gap:12px;margin-bottom:14px;cursor:pointer;" onclick="switchTab('insight')">
  <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
  <div style="flex:1;font-size:12.5px;color:var(--ink2);"><b style="color:var(--ink);">Spend TikTok Ads naik 32%</b> tapi closing stagnan minggu ini — cek AI Insight untuk saran.</div>
  <span style="font-size:12px;font-weight:700;color:var(--accent);white-space:nowrap;">Lihat detail →</span>
</div>
```

```html
<!-- after -->
<div class="panel hidden" id="proactiveAlertCard" style="border-left:4px solid var(--red);display:flex;align-items:center;gap:12px;margin-bottom:14px;cursor:pointer;" onclick="switchTab('insight')">
  <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
  <div style="flex:1;font-size:12.5px;color:var(--ink2);" id="proactiveAlertText"><b style="color:var(--ink);">Spend TikTok Ads naik 32%</b> tapi closing stagnan minggu ini — cek AI Insight untuk saran.</div>
  <span style="font-size:12px;font-weight:700;color:var(--accent);white-space:nowrap;">Lihat detail →</span>
</div>
```

- [x] **Step 3: Add the trigger-condition logic in the script block**

Add this near the other Overview render functions (e.g. right before `renderTargets()`'s definition):

```js
/* ===== OVERVIEW: proactive alert trigger ===== */
/* Trigger kondisi: platform manapun dengan spend naik >= SPEND_SPIKE_PCT
   TAPI closing naik < CLOSING_STAGNANT_PCT di periode yang sama (angka
   diambil dari PLATFORMS[key].metrics.*.sub, format "▲ NN% ..." / "▼ NN% ..."). */
var SPEND_SPIKE_PCT = 20;
var CLOSING_STAGNANT_PCT = 5;
function parsePct(subText){
  var m = String(subText).match(/(\d+(?:\.\d+)?)%/);
  return m ? parseFloat(m[1]) : 0;
}
function renderProactiveAlert(){
  var card = document.getElementById('proactiveAlertCard');
  var triggered = Object.keys(PLATFORMS).some(function(key){
    var m = PLATFORMS[key].metrics;
    var spendUp = /▲/.test(m.Spend.sub) && parsePct(m.Spend.sub) >= SPEND_SPIKE_PCT;
    var closingStagnant = parsePct(m.Closing.sub) < CLOSING_STAGNANT_PCT;
    if(spendUp && closingStagnant){
      document.getElementById('proactiveAlertText').innerHTML =
        '<b style="color:var(--ink);">Spend '+PLATFORMS[key].name+' naik '+Math.round(parsePct(m.Spend.sub))+'%</b> tapi closing stagnan minggu ini — cek AI Insight untuk saran.';
      return true;
    }
    return false;
  });
  card.classList.toggle('hidden', !triggered);
}
```

- [x] **Step 4: Call it once at page init**

Find the init block near the bottom of the script (`renderTable(); renderTargets(); renderBenchmark(); ...`) and add the call:

```js
// before
renderTable();
renderTargets();
renderBenchmark();

// after
renderTable();
renderTargets();
renderProactiveAlert();
renderBenchmark();
```

- [x] **Step 5: Re-run the same two verification commands from Task 1 (Steps 4 and 5)**

Expected: `JS OK`, `open: []`, `errors: []`, `missing ids: set()` — same as before, now covering the new `proactiveAlertCard`/`proactiveAlertText`/`parsePct`/`renderProactiveAlert` identifiers too.

- [x] **Step 6: Manual checkpoint**

Open in browser → Overview tab. With current mock data (TikTok spend +32%, closing +1%), the card should show, worded around TikTok. This confirms the *logic path* fires correctly — the checklist item is about the trigger existing in code, not about forcing the demo data to prove the false-branch too.

---

## Part B — Phase 0: Foundation (real Next.js + Firebase project)

Corresponds to `implementation-phases.md` Phase 0. This is the actual "development stage" the user is about to enter — Part A above is prototype polish, not this.

**Assumption flagged for confirmation:** these tasks scaffold the new project into a sibling folder `lensa-app/` inside this same `Assessment` directory, next to the existing mockup/standards files, so nothing already there gets touched or overwritten. If a different location/repo is wanted, say so before Task 3 (npm installs) runs.

### Task 3: Scaffold Next.js 14 + TypeScript strict + Tailwind

**Files:**
- Create: `lensa-app/` (entire new Next.js project, generated by the CLI below)

**Interfaces:**
- Produces: `lensa-app/` as the project root all later Part B tasks operate inside; `lensa-app/tsconfig.json` with `"strict": true`.

- [x] **Step 1: Run the Next.js scaffolding CLI**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment" && npx create-next-app@14 lensa-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```
Expected: prompts (if any) answered — App Router: yes, `src/` directory: yes, Tailwind: yes, ESLint: yes, import alias `@/*`. Completes with `lensa-app/` created.

- [x] **Step 2: Force TypeScript strict mode**

Modify `lensa-app/tsconfig.json` — confirm `"strict": true` is present under `compilerOptions` (create-next-app sets this by default for TS projects, but verify):
```bash
grep -n '"strict"' "lensa-app/tsconfig.json"
```
Expected: `"strict": true,`. If missing or `false`, edit it to `true`.

- [x] **Step 3: Verify the scaffold builds and runs**

```bash
cd lensa-app && npm run build
```
Expected: build succeeds with the default Next.js starter page, no TypeScript errors.

- [x] **Step 4: Manual checkpoint (no git repo yet inside `lensa-app/` either — skip commit)**

`create-next-app` auto-initializes its own git repo inside `lensa-app/` by default. Leave it as-is (that's normal/expected for a fresh Next.js project) — this doesn't conflict with the parent `Assessment/` folder not being a repo.

---

### Task 4: Wire up design tokens from `design-system.md`

**Files:**
- Modify: `lensa-app/tailwind.config.ts`
- Modify: `lensa-app/src/app/globals.css`

**Interfaces:**
- Consumes: color values finalized in `design-system.md` (amber accent, semantic status colors, neutral base).
- Produces: Tailwind theme tokens (`bg-accent`, `text-ink2`, etc.) and CSS variables that Task 5's shadcn/ui init and all future components rely on for color consistency.

- [x] **Step 1: Add CSS variables to `globals.css`**

```css
:root {
  --bg: #f7f7f9;
  --card: #ffffff;
  --line: #e8e8ee;
  --line-2: #f0f0f4;
  --ink: #16161a;
  --ink-2: #6b6b76;
  --ink-3: #9d9da6;
  --accent: #f0b400;
  --accent-bg: #fff6d6;
  --accent-text: #8a6400;
  --green: #0f9d5f;
  --green-bg: #e5f7ee;
  --amber: #c07d09;
  --amber-bg: #fdf0d8;
  --gray: #8b8f99;
  --gray-bg: #f0f1f4;
  --red: #d23b3b;
  --red-bg: #fbe9e9;
  --radius: 16px;
}
```

- [x] **Step 2: Map them into `tailwind.config.ts` theme.extend.colors**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        accent: "var(--accent)",
        "accent-bg": "var(--accent-bg)",
        "accent-text": "var(--accent-text)",
        green: "var(--green)",
        "green-bg": "var(--green-bg)",
        amber: "var(--amber)",
        "amber-bg": "var(--amber-bg)",
        gray: "var(--gray)",
        "gray-bg": "var(--gray-bg)",
        red: "var(--red)",
        "red-bg": "var(--red-bg)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [x] **Step 3: Add the Inter font via `next/font` in `src/app/layout.tsx`**

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
```
Apply `inter.className` to the root `<body>` tag in the same file.

- [x] **Step 4: Verify the tokens actually apply**

Temporarily add `<div className="bg-accent text-ink p-4 rounded">token check</div>` to `src/app/page.tsx`, run:
```bash
npm run dev
```
Expected: visiting `localhost:3000` shows an amber (`#f0b400`) box with dark text — confirms the CSS variable → Tailwind class pipeline works. Remove the test div after confirming, then re-run `npm run build` to confirm it still succeeds.

---

### Task 5: Install core dependencies, shadcn/ui, and testing infra

**Files:**
- Modify: `lensa-app/package.json` (via installs below)
- Create: `lensa-app/components.json` (shadcn/ui config, generated by its CLI)
- Create: `lensa-app/vitest.config.ts`
- Create: `lensa-app/src/test/setup.ts`

**Interfaces:**
- Produces: `npm run test` script wired to Vitest; shadcn/ui `Button`/`Card` components available under `@/components/ui/*` for later Phase 1+ tasks to import.

- [x] **Step 1: Init shadcn/ui**

```bash
cd lensa-app && npx shadcn@latest init -d
```
Expected: `components.json` created, `src/lib/utils.ts` created (the `cn()` helper), `src/components/ui/` directory created.

- [x] **Step 2: Add the first two base components as a smoke test**

```bash
npx shadcn@latest add button card
```
Expected: `src/components/ui/button.tsx` and `src/components/ui/card.tsx` created without errors.

- [x] **Step 3: Install remaining core dependencies**

```bash
npm install zustand @tanstack/react-query zod recharts framer-motion firebase
```
Expected: all install without peer-dependency errors (React 18/Next 14 compatible versions resolved automatically since these are current-generation libs).

- [x] **Step 4: Install and configure Vitest + React Testing Library + MSW**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom msw
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Create `src/test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [x] **Step 5: Write one throwaway smoke test to prove the whole test pipeline works**

Create `src/components/ui/__tests__/button.smoke.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

test("renders a button with its label", () => {
  render(<Button>Klik saya</Button>);
  expect(screen.getByRole("button", { name: "Klik saya" })).toBeInTheDocument();
});
```

Run:
```bash
npm run test
```
Expected: `1 passed`. Delete this smoke test file once confirmed (its only job was proving the pipeline works — real component tests come with each real feature in Phase 1+).

---

### Task 6: Firebase project wiring (Auth, Firestore, Hosting client config)

**Files:**
- Create: `lensa-app/src/lib/firebase/client.ts`
- Create: `lensa-app/.env.local.example`
- Modify: `lensa-app/.gitignore` (confirm `.env.local` is ignored — Next.js's default already includes it, just verify)

**Interfaces:**
- Produces: `getFirebaseApp()`, `getFirebaseAuth()` — the only two exports later Phase 1 auth-flow tasks (`00-auth-flow.md`) are allowed to import from for client-side Firebase access.

- [x] **Step 1: Confirm `.env.local` is git-ignored**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment" && grep -n "env.local" "lensa-app/.gitignore"
```
Expected: a line matching `.env*.local` (create-next-app includes this by default).

- [x] **Step 2: Create the env var template**

Create `lensa-app/.env.local.example`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
Note: real Firebase project creation (via the Firebase console or `firebase init`) requires an interactive login this agent cannot perform — the user needs to run `firebase login` themselves (suggest `! firebase login` per this session's convention for interactive commands) and paste the resulting config values into their own untracked `.env.local` (copied from this example) before Task 6 Step 4 can be verified end-to-end.

- [x] **Step 3: Write the client Firebase init module**

Create `src/lib/firebase/client.ts`:
```ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
```

- [x] **Step 4: Verify it compiles (real auth calls come in Phase 1)**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npx tsc --noEmit
```
Expected: no type errors. This only proves the module compiles — it does **not** prove Firebase Auth actually works end-to-end, since that needs a real Firebase project's env vars (Step 2's blocker). Note that gap explicitly rather than claiming success.

---

### Task 7: Feature-based folder skeleton (fills the missing `31-frontend-nextjs.md`)

**Why:** `AGENTS.md` and `lensa-fe-builder.md` both point to `docs/31-frontend-nextjs.md` for folder/state conventions, but that file does not exist anywhere in this repo (confirmed during the standards review). Rather than silently pretending it exists, this task defines the convention this project actually uses, inline, so every later Phase 1+ task has one place to point to.

**Files:**
- Create: `lensa-app/src/features/.gitkeep` (placeholder — real feature folders get created as each Phase 1+ task needs them)
- Create: `lensa-app/src/stores/ui.ts`
- Create: `lensa-app/src/stores/auth.ts`
- Create: `lensa-app/src/lib/query-client.ts`
- Create: `31-frontend-nextjs.md` (the convention doc itself, so future work has a real file to cite instead of a broken reference)

- [x] **Step 1: Write the convention doc**

Create `31-frontend-nextjs.md`:
```markdown
# Lensa — Frontend Conventions (Next.js)

> Fills the gap left by a referenced-but-missing internal BDD standard. Written for this project specifically, not copied from elsewhere.

## Folder structure
- `src/app/` — Next.js App Router routes only (page.tsx, layout.tsx, route handlers). No business logic here — delegate to `src/features/*`.
- `src/features/<feature>/` — one folder per feature (e.g. `overview-dashboard`, `ai-insight`, `connect-platform`). Each contains `components/`, `hooks/`, `api/` (TanStack Query hooks + Zod schemas) as needed — don't pre-create empty subfolders, add them when the feature actually needs them.
- `src/components/ui/` — shadcn/ui primitives only (generated via `npx shadcn add`). Don't hand-edit generated files beyond what shadcn's own docs recommend.
- `src/stores/` — exactly two files: `ui.ts` and `auth.ts`. No other Zustand stores.
- `src/lib/` — cross-feature utilities (`firebase/`, `query-client.ts`, `utils.ts`).

## State
- Server state → TanStack Query only, query keys always include the scoping ids they depend on (e.g. `["overview", businessId, dateRange]` per `PROJECT-ANALYSIS.md`'s AccountParams × RangePickerParams pattern).
- Client/UI state → Zustand, `ui` store (nav state, active business id, modals) + `auth` store (in-memory token/user, never persisted to localStorage) only.
- Form/boundary validation → Zod schemas colocated in each feature's `api/` folder.

## Naming
- Components: PascalCase file + export name matching.
- Hooks: `use-*.ts`, camelCase export.
- No `any` without an inline comment explaining why it's unavoidable.
```

- [x] **Step 2: Create the stores with their final shape**

Create `src/stores/ui.ts`:
```ts
import { create } from "zustand";

interface UiState {
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeBusinessId: null,
  setActiveBusinessId: (id) => set({ activeBusinessId: id }),
}));
```

Create `src/stores/auth.ts`:
```ts
import { create } from "zustand";
import type { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

- [x] **Step 3: Create the TanStack Query client**

Create `src/lib/query-client.ts`:
```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});
```

- [x] **Step 4: Placeholder the features folder**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && mkdir -p src/features && touch src/features/.gitkeep
```

- [x] **Step 5: Verify everything still compiles**

```bash
cd "/Users/jinjiartworks/Documents/Jinji/Work/BDD/Assessment/lensa-app" && npx tsc --noEmit && npm run build
```
Expected: no errors. This closes out Phase 0 — the project builds, has design tokens wired, has testing infra proven to work, has Firebase client scaffolding (pending real project credentials from the user), and has a documented folder/state convention that Phase 1 tasks can cite by file path instead of a broken reference.

---

## Part C — Phase 1–4 (not detailed here, on purpose)

`implementation-phases.md` already lists these at the right level of granularity for right now:

- **Phase 1 — Core Dashboard:** `01-connect-platform-onboarding.md`, `02-business-switcher.md`, `03-overview-dashboard.md`, `04-platform-detail-dashboard.md`
- **Phase 2 — AI Layer:** `05-ai-insight-panel.md`, `06-insight-card-export.md`
- **Phase 3 — Monetization:** `08-pricing-page.md` (Ticket/Support dropped, see Decisions Log)
- **Phase 4 — Polish & Write-up**

Each of these needs its **own** bite-sized plan (this same `writing-plans` skill, re-invoked) written **after** Part B lands — not now. Reason: bite-sized tasks require exact file paths and function signatures per the plan-writing rules, and those don't exist yet for pages/components that haven't been scaffolded. Writing them today would mean inventing plausible-sounding but unverified specifics, which is exactly the kind of unfounded detail a plan is supposed to avoid.

---

## Decisions Log (resolves the open items from prior review)

Recorded here so the reasoning survives even if this plan file is read on its own, out of the conversation that produced it.

1. **Execution mode:** proceeding to real Next.js 14 + Firebase (`Part B`), per the user's explicit framing of "before we enter the development stage" — the HTML mockup (`lensa-dashboard-full-interactive_1.html`) is the finished, spec-aligned prototype reference; it is not being carried forward as the shipped artifact.
2. **Support/Ticket system, Compare 2 Platform:** confirmed out of scope, already reflected in `business-plan.md` §9 and the two feature docs.
3. **Accent color:** amber/gold confirmed as final (not purple), already reflected in `design-system.md`.
4. **Deferred, not forgotten** — flagged in the prior review round, deliberately **not** turned into tasks in this plan:
   - Google Analytics & Marketplace Ads platform catalog (extends Connect Platform + Detail Platform's ads-vs-analytics metric distinction) — belongs in the Phase 1 plan for `01`/`04`, once written.
   - Billing "Paket Tersedia" footer mock/simulasi disclaimer — belongs in the Phase 3 plan for `08`, trivial one-line addition, no reason to detail it as its own Phase 0 task.
   - Real `html2canvas`-rendered "Copy as Report" (vs. today's static text modal) — belongs in the Phase 2 plan for `06`.
   - Connect-platform failure/retry error state — belongs in the Phase 1 plan for `01`.
   - Business Switcher Free-tier upgrade-prompt gate — belongs in the Phase 1 plan for `02`; note the doc itself already assumes "Pro sudah aktif" as the prototype's working baseline, so this is low priority even then.
