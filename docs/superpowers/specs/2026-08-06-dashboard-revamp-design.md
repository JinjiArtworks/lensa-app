# Dashboard Revamp — Design Spec

**Tanggal:** 2026-08-06
**Status:** Approved oleh user (brainstorming dialog inline, per-bagian), lanjut ke implementation plan.

## 1. Konteks & Kenapa

Sesi ini dipicu user yang udah bisa sign-up/login/masuk dashboard beneran (setelah fix env var Firebase ke Vercel sesi sebelumnya), lalu me-review dashboard secara menyeluruh dan minta perbaikan/penambahan lintas hampir semua halaman: Overview, Detail Platform, AI Insight, Billing, Settings, Connect Platform — plus 3 global component baru (Filter, Sync, Copy-as-Report) dan perluasan pola lock/gating Free-vs-Pro yang udah dibangun di Onboarding sesi sebelumnya.

Scope-check terhadap `business-plan.md` §5/§9 sebelum desain ini disetujui:
- **Detail Platform "sub-menu 2 platform"** dikonfirmasi user maksudnya **tab switcher single-view** (lihat 1 platform per waktu, tab lain di-lock kalau Free) — **bukan** "Mode Compare 2 Platform" yang resmi dicoret dari scope (§9). Aman.
- **Download invoice** dikonfirmasi tetap simulasi/mock, konsisten sama keputusan "billing UI nggak fungsional" (§9). Aman — dan ternyata sebagian fitur ini (riwayat invoice, tanggal perpanjangan) udah ada di `PlanSummary.tsx`.
- **Hapus Team & Akses di Settings** — ini koreksi drift, bukan kerjaan baru: §9 dari awal bilang team/permission out-of-scope, cuma belum pernah dihapus dari UI.
- **Global FilterBar harus beneran mengubah angka** (dikonfirmasi user, bukan cuma kosmetik) — nambah scope teknis: extend `lib/seed.ts` + route handler + query key, bukan cuma komponen UI.

## 2. Temuan Implementasi Existing (grounding sebelum desain)

- **Lock/gating pattern** udah ada di `src/app/onboarding/page.tsx`: `Lock` icon (`lucide-react`), `isLocked = !isDone && limitReached`, dialog shadcn "Ganti ke X? / Upgrade ke Pro" (baris 201-229), plan dibaca via `useBusinessPlan(activeBusinessId)`.
- **Detail Platform** (`src/app/(dashboard)/detail/page.tsx`) punya `PlatformSwitcher` chip **tanpa gating apapun** — meta/tiktok selalu tampil apa pun plan-nya.
- **AI Insight** (`src/app/(dashboard)/insight/page.tsx`) **belum punya tombol Copy-as-Report sama sekali**. Filter periode/platform pakai native `<select>`, bukan shadcn.
- **Overview** `TrendChart.tsx` — Recharts `AreaChart` **tanpa `<Tooltip>`** sama sekali.
- **Billing** (`src/app/(dashboard)/billing/page.tsx`) 2 tab custom (`BillingTabs`, bukan shadcn Tabs): "Ringkasan" & "Paket Tersedia". Tab Pro **udah ada** "Riwayat Invoice" + tanggal perpanjangan otomatis. `PackageComparison.tsx` cuma pakai teks ✓/✕, tanpa lock icon.
- **Settings** — `SettingsTabs.tsx` custom, 3 tab: `team`/`notif`/`security`.
- **Connect Platform** (nav dashboard, `PlatformConnectionList.tsx`) — **statis total**, hardcode `PLATFORM_CONNECTIONS`, sama sekali nggak baca Firestore/plan asli. Icon platform di semua tempat masih text badge ("M"/"TT"), tidak ada SVG logo asli.
- **shadcn primitives yang ada:** `badge`, `button` (varian `default`/`secondary` udah pas buat primary/secondary), `card`, `dialog`, `progress`, `toaster`. **Belum ada** `tabs`, `tooltip`, `select`, `popover` — perlu `npx shadcn@2 add tooltip popover` minimal (tabs kalau dipakai buat Detail Platform sub-menu).

## 3. Desain — Global Components

Lokasi: `src/components/shared/` (folder baru, sejajar `src/components/ui/` yang khusus shadcn primitive per konvensi `CLAUDE.md`).

### 3.1 `SyncButton`
- `variant="default"` (primary). Props: `queryKey: unknown[]`, `label?` (default "Sync"). Spinner otomatis saat `isFetching` (pakai `useIsFetching({queryKey})` dari TanStack Query).
- Ganti semua tombol Sync `ghost` yang sekarang di Overview & Detail Platform; tambah baru (ganti dari existing) di AI Insight; tambah baru total di Billing.

### 3.2 `CopyAsReportButton`
- `variant="secondary"`. Reuse `ExportReportModal` yang udah ada (Overview & Detail Platform) — generalisasi propnya kalau perlu.
- AI Insight: bikin baru total. Modal isinya ringkasan insight (bukan chart), bukan komponen baru dari nol — reuse `ExportReportModal` dengan varian konten teks.

### 3.3 `FilterBar`
- 4 preset chip: **This Week / This Month / This Year / Custom Range**. Custom → date-range picker (`npx shadcn@2 add popover` + calendar sederhana).
- Props: `defaultPreset`, `onChange({preset, from, to})`, controlled per halaman (Overview default "year", AI Insight default "week", dst — 1 komponen, default beda per pemakaian).
- **Filter beneran mengubah angka** (dikonfirmasi user): `lib/seed.ts` ditambah faktor variance per date-range preset (pola sama seperti variance per `businessId` yang udah ada — `seededVariance` di-extend menerima parameter `range`). Query key jadi `["platform-metrics", businessId, range]`. `/api/platform-metrics` route handler terima param `range` baru. AI Insight yang udah punya period-compare logic sendiri di-rewire pakai `FilterBar` yang sama (ganti native `<select>`), bukan dua sistem filter berbeda.

## 4. Desain — Pola Lock/Gating Pro (reusable)

Extract dari pola Onboarding jadi 2 primitive di `src/components/shared/`, plus Onboarding sendiri dimigrasi ikut pakai primitive ini (bukan dibiarkan pakai versi lokalnya sendiri — 1 sumber kebenaran).

- **`useProGate(businessId)`** — wrap `useBusinessPlan`, return `{isFree, isLocked(feature)}`.
- **`<ProLockBadge>`** — icon `Lock` kecil + `title` tooltip singkat, styling reuse `opacity-60`/`bg-gray-bg` dari Onboarding.
- **`<ProUpgradeDialog>`** — generalisasi dialog "Ganti ke X? / Upgrade ke Pro", dipanggil dengan konteks pesan berbeda per halaman.

Dipasang di: tab Detail Platform yang terkunci, item Connect Platform yang terkunci, baris benefit Pro-only di Billing `PackageComparison`.

## 5. Desain — Per Halaman

| Halaman | Perubahan |
|---|---|
| **Overview** | Pasang `FilterBar`+`SyncButton`+`CopyAsReportButton` di header. `TrendChart` tambah Recharts `<Tooltip>`. Section baru: **donut chart "Kontribusi Platform"** (share spend/konversi per platform), komplemen `ChannelChart` (bar) yang udah ada. |
| **Detail Platform** | 3 global component di header. `PlatformSwitcher` di-gating via `useProGate`+`ProLockBadge`+`ProUpgradeDialog`. Visual metrics disamakan style ke `KpiGrid` Overview, isinya tetap spesifik platform terpilih. |
| **AI Insight** | Native `<select>` diganti `FilterBar`. Tambah `CopyAsReportButton` (baru) + `SyncButton` primary (ganti dari existing). Layout dipecah jadi section jelas (stats-at-a-glance → priority actions → benchmark+budget → grid insight) pakai spacing/divider. Copy tiap insight card diperjelas jadi lebih actionable. |
| **Billing** | Gabung 2 tab jadi 1 halaman scroll (Ringkasan atas, "Paket Tersedia" jadi section bawah, bukan tab). Tambah `ProLockBadge` di baris benefit Pro-only `PackageComparison`. Tier Free dilengkapi info (bukan 1 paragraf sparse). Download invoice dibiarkan mekanismenya sama (mock/toast). |
| **Settings** | Hapus tab "Team & Akses" total (`TeamTab.tsx` dihapus, `SettingsTabs` sisa notif+security). |
| **Connect Platform** | Full rewire dari static mock ke data asli (`useBusinesses`/plan Firestore). Platform connected tampil normal, platform lain di-lock kalau Free. Icon text badge diganti SVG logo Meta/TikTok inline (bukan asset eksternal). |

## 6. Urutan Eksekusi (checkpoint per fase, dikonfirmasi user)

1. Global components (`SyncButton`, `CopyAsReportButton`, `FilterBar` + extend `lib/seed.ts`/route handler) + pola gating reusable (`useProGate`, `ProLockBadge`, `ProUpgradeDialog`) + migrasi Onboarding ke primitive baru.
2. Overview — pasang global components, tooltip chart, donut chart baru.
3. Detail Platform — pasang global components, gating switcher, samain visual metrics.
4. AI Insight — pasang global components, restructure layout, perjelas copy.
5. Billing — merge tab jadi 1 halaman, lock icon benefit, lengkapi info Free.
6. Settings — hapus Team & Akses.
7. Connect Platform — full rewire data asli + real icon.

User minta cek-in tiap fase kelar sebelum lanjut fase berikutnya — bukan run semua tanpa henti.

## 7. Out of Scope (ditegaskan ulang)

- Compare mode 2 platform bersamaan (tetap dicoret, sesuai §9).
- Invoice generator/PDF asli atau payment gateway fungsional (tetap mock/simulasi).
- Team/permission per bisnis (dihapus dari UI, bukan cuma didiemin).
