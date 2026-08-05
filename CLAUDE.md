# Lensa

Omni-channel ads performance dashboard (Meta Ads + TikTok Ads) with AI-generated insight, built as a Sr. FE Dev assessment prototype (BDD.ai). Next.js 14 App Router + TypeScript strict + Tailwind + shadcn/ui + Firebase (Auth/Firestore) + TanStack Query.

## Full project context lives in docs/

The PRD, phase roadmap, per-feature specs, and decisions log live in `docs/` (moved into this repo 2026-08-05 — previously an untracked sibling directory called `standards/`, see `docs/PROGRESS.md`'s session log for that history). Read in this order before starting work:

1. `docs/PROGRESS.md` — progress hub, chronological by session. Has a "resume here" section at the top — read this first when picking up work.
2. `docs/implementation-phases.md` — phase-level roadmap/checklist.
3. `docs/business-plan.md` — PRD equivalent: positioning, target user, business model, §5 in-scope features, §9 explicit out-of-scope decisions.
4. `docs/decisions-log.md` — non-obvious technical decisions, organized by topic (why X not Y, trade-offs accepted).
5. `docs/00-*.md` … `docs/09-*.md` — per-feature specs. Only read the one relevant to the current task.
6. `docs/31-frontend-nextjs.md` — the FE conventions this file summarizes below.
7. `docs/10-data-flow-reference.md` / `docs/11-firebase-firestore-guide.md` — as-built data architecture (Firebase vs mock ads-metrics domains) and a from-scratch Firestore primer.
8. `docs/AGENTS.md` — subagent scope-alignment rules. Also documents which parts of the original plan (a `docs/features/` subfolder) were never actually realized — check it before trusting an old cross-reference at face value.

**Before building or changing anything, check it's actually in scope** (`business-plan.md` §5/§9). If a request looks like it's building something explicitly marked out-of-scope (team permissions, functional payment gateway, ticket/support system, platform Compare mode), stop and confirm with the user first instead of building it.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (also the main correctness check, alongside `tsc`)
- `npx tsc --noEmit` — type check
- `npm run lint` — ESLint
- There is currently **no automated test suite** — it was deliberately deleted (see `decisions-log.md` §6.1). Verification is `tsc` + `next build` + manual/curl smoke testing. Don't add tests back in without checking with the user first; `vitest`/`testing-library` deps and config are still present if that decision is ever reversed.

## Folder conventions

- `src/app/` — routes only (`page.tsx`, `layout.tsx`, route handlers). No business logic — delegate to `src/features/*`.
- `src/features/<feature>/` — one folder per feature, `components/`/`hooks/`/`api/` added only as needed, don't pre-scaffold empty folders.
- `src/components/ui/` — shadcn/ui primitives only. **Adding a new one:** `npx shadcn@2 add <component>` — never `@latest` (generates Tailwind v4 output that won't build on this project's Tailwind v3.4.1). After running it, check `tailwind.config.ts`/`globals.css` for a duplicate `:root` block or `oklch()`/`hsl()` nesting the CLI may have introduced, and remap shadcn's semantic color keys to this project's own `var(--*)` tokens (`design-system.md`). Full procedure in `docs/31-frontend-nextjs.md`.
- `src/stores/` — exactly `ui.ts` + `auth.ts`, no other Zustand stores.
- `src/lib/` — cross-feature utilities (`firebase/`, `query-client.ts`, `utils.ts`).
- Server state → TanStack Query, query keys always scoped (e.g. `["platform-metrics", businessId]`). Client/UI state → Zustand. Validation → Zod, colocated in each feature's `api/`.

## Gotchas

- Tailwind v3's default spacing scale has no `4.5`/`6.5`/`7.5`/`15` keys (only `.5` steps between integers) — a class like `p-4.5` is silently dropped, not an error. Use the nearest valid key.
- `tsconfig.json` needs `"types": ["vitest/globals"]` — don't remove even though the test suite is gone, other tooling still expects it.
- Firebase project itself isn't provisioned yet — `.env.local` (see `.env.local.example`) needs a real project's config before Auth/Firestore calls will work against anything real.

## Subagents

`.claude/agents/` has 4 project-specific subagents (`lensa-orchestrator`, `lensa-fe-builder`, `lensa-design-consistency`, `lensa-reviewer`) — see `docs/AGENTS.md` §2 for what each one does and the intended handoff order. They're optional to use; direct/inline work without dispatching them is the historically preferred mode for this project (see `docs/PROGRESS.md`), so don't force a subagent dispatch the user hasn't asked for.

## Git workflow

- After finishing a task: commit the specific touched files (not `-A`), `git push origin main`, and update `docs/PROGRESS.md` with a new session entry — do this by default, don't wait to be asked each time.
- Never add a "Co-Authored-By: Claude" (or any Claude/Anthropic) line to commit messages in this project.
