# Lensa — Implementation Phases

> Urutan eksekusi. Tiap phase harus "demo-able" sebelum lanjut ke phase berikutnya — jangan loncat phase walau kepengen cepat.
>
> **Status detail per task (bukan cuma checklist di sini) ada di [`PROGRESS.md`](./PROGRESS.md)** — file ini cuma rollup level-tinggi. Kalau resume kerjaan abis context reset, baca `PROGRESS.md` dulu.

## Phase 0 — Foundation
**Tujuan:** kerangka project berdiri, siap diisi fitur.
**Status: 4/5 selesai** — lihat `plan-2026-08-01-lensa-phase0.md` (semua step checked).
- [x] Setup Next.js 14 App Router + TS strict + Tailwind + shadcn/ui init
- [ ] Setup Firebase project (Auth, Firestore, Hosting) — 🔶 **PARTIAL**: client SDK module (`getFirebaseApp`/`getFirebaseAuth`) sudah jadi, tapi belum ada project Firebase asli (butuh user jalanin `firebase login` interaktif, agent nggak bisa)
- [x] Terapin `design-system.md` jadi design tokens nyata (Tailwind config / CSS variables)
- [ ] Bangun `00-auth-flow.md` (sign up, sign in, forgot password) — 🔶 **PARTIAL**: Sign In UI selesai (`plan-...-ui-slice-2.md` Task 1), tapi masih dekoratif (nggak ada Firebase Auth call beneran). Sign up & forgot password belum ada sama sekali.
- [x] Struktur folder feature-based sesuai `31-frontend-nextjs.md` (ditulis di Task 7, termasuk warning shadcn v2-vs-v4)

## Phase 1 — Core Dashboard (paling dipoles, paling sering dilihat evaluator)
**Tujuan:** alur inti "connect → lihat data" jalan end-to-end dengan mock data.
**Status: UI porting selesai untuk keempat fitur (semua UI-only), logic/data wiring belum ada di semuanya** — lihat `plan-2026-08-01-lensa-phase1-ui-slice-1.md`, `-ui-slice-2.md`, `-ui-slice-3.md`.
- [ ] `01-connect-platform-onboarding.md` — 🔶 **PARTIAL**: UI onboarding + simulasi connect selesai (`/onboarding`, UI Slice 2 Task 2). Belum: empty state khusus, persist ke Firestore, error/retry state kalau gagal connect.
- [ ] `02-business-switcher.md` — 🔶 **PARTIAL**: UI switcher di Sidebar selesai (UI Slice 1 Task 2), data masih hardcoded 2 bisnis lokal. Belum: tambah bisnis beneran, free-tier gate, Firestore.
- [ ] `03-overview-dashboard.md` — 🔶 **MOSTLY DONE** (UI Slice 1 Task 3-5): KPI ✓, coverage banner ✓ (statis), target tracker ✓, proactive alert ✓ (logic asli), channel+trend chart ✓, campaign table+modal ✓. Belum: tombol Sync (perlu data-refetch story), "Copy as report" (perlu html2canvas), Last Synced timestamp yang beneran live.
- [ ] `04-platform-detail-dashboard.md` — 🔶 **MOSTLY DONE** (UI Slice 3, 2 task, selesai semua): platform switcher ✓, KPI grid 8-metrik ✓, Tren Performa chart (Spend/Closing toggle, warna per-platform) ✓, campaign table ter-filter + empty-state ✓. Belum: metrik ads-vs-analytics (nunggu Google Analytics masuk katalog), "Copy as report".

> Checkpoint: di titik ini produk harus sudah bisa didemoin dari sign up → connect platform → lihat dashboard lengkap dengan data (walau mock). **Belum tercapai** — masih UI-only, belum ada auth/data persistence nyata.

## Phase 2 — AI Layer (differentiator utama)
**Tujuan:** nilai tambah AI yang bikin produk ini beda dari native ads manager.
**Status: `05` selesai (sesi kelima, 2026-08-02), `06` belum.**
- [x] `05-ai-insight-panel.md` — halaman `/insight` lengkap (template bank, filter, priority panel, sync), reuse logic Proactive Alert Card. Belum: panel Benchmark Industri/Budget Rec (di luar checklist, sengaja tidak diporting).
- [ ] `06-insight-card-export.md`

## Phase 3 — Monetization
**Tujuan:** lengkapin sisi business model produk.
**Status: 08 selesai UI-nya** — lihat `plan-2026-08-01-lensa-phase1-ui-slice-4.md`.
- [ ] ~~`07-ticket-support.md`~~ — dicoret dari scope, lihat `business-plan.md` §9
- [ ] `08-pricing-page.md` — 🔶 **MOSTLY DONE**: `/billing` sub-tab Ringkasan (plan+payment+invoice) ✓, Paket Tersedia (Free/Pro) ✓, simulasi payment gateway "Perpanjang Sekarang" (confirm→processing→success, update invoice) ✓. Belum: alur upgrade Free→Pro dari limit-gate (mis. Business Switcher).

## Phase 4 — Polish & Write-up
**Tujuan:** siap dievaluasi.
**Status: belum mulai.**
- [ ] Review semua checklist di tiap file fitur
- [ ] Responsive check (mobile/tablet) di semua halaman
- [ ] Tulis bagian Product Thinking, Depth, Breadth/Leadership, AI Leverage berdasarkan `business-plan.md` + `AGENTS.md`
- [ ] Deploy ke server yang disediakan BDD (cek dulu instruksi server-nya)

---

**Prinsip lintas-phase:** kalau di tengah jalan nemu ide fitur baru yang ngga ada di `business-plan.md`, JANGAN langsung build — catat dulu, cek relevansi ke `AGENTS.md` §1 (aturan alignment), baru putuskan.
