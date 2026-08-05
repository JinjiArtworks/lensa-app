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

## Adding new shadcn/ui components (read before running `shadcn add`)

During Task 5 we hit a build-breaking issue that will recur if this isn't followed:

**Problem:** The default/newest CLI (`npx shadcn@latest add <component>`) generates Tailwind-v4-oriented code — `oklch(...)` color values, `@base-ui/react` primitives, bracketed arbitrary-value syntax like `gap-(--x)`. This project is on Tailwind **v3.4.1**, so `@latest` output does not compile and will break the build.

**Working fix — pin the CLI major version:**
```bash
npx shadcn@2 add <component>
```
As of this writing this resolves to `2.10.0` and generates classic "New York" style components built on `@radix-ui/react-slot` with plain Tailwind v3 utilities. This version of the CLI works with this project's setup.

**But `@2` still isn't safe to run blindly.** Its generated `tailwind.config.ts` / `globals.css` output needs manual reconciliation every time, because the CLI:
1. Writes color values as raw `oklch(...)` strings while simultaneously wrapping them in `hsl(var(--x))` in `tailwind.config.ts` — that nesting (`hsl(oklch(...))`) is invalid CSS and will not resolve.
2. Duplicates `:root` variable definitions for keys like `--card` and `--accent` that already exist as this project's real design tokens — if left in place, the duplicate silently overrides the actual tokens from `design-system.md` further down the cascade.

**Required procedure for every new shadcn component in Phase 1+:**
1. Run `npx shadcn@2 add <component>` — never `@latest`.
2. If the command touched `tailwind.config.ts` or `globals.css`, open both files and check for:
   - a second/duplicate `:root { ... }` block introduced by the CLI — delete it, keep only this project's original block.
   - any `hsl()`/`oklch()` nesting or newly-introduced raw color literals — remove them.
3. Remap every shadcn semantic color key the component references (`primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`, `background`, `foreground`, `border`, `input`, `ring`) to this project's own `var(--*)` tokens as defined in `design-system.md` — do not trust the CLI's default values for these keys.
4. Re-run `npx tsc --noEmit && npm run build` before considering the component done.

Skipping step 2/3 is exactly what broke the build during Task 5 — don't trust `shadcn add`'s config/CSS output as-is, even on the pinned `@2` version.
