# Decisions Log — Lensa

> Catatan keputusan teknis non-obvious, disusun **per topik** (bukan kronologis kayak `PROGRESS.md`). Tujuan: bahan belajar ulang & presentasi assessment — tiap entry jawab "kenapa begini, bukan begitu" + trade-off yang sadar dilepas. Update tiap ada keputusan baru yang nggak trivial, jangan nunggu akhir project.

Format tiap entry: **Keputusan** → **Kenapa** → **Trade-off** → *Sumber* (file lain yang punya detail lengkap, biar nggak duplikasi).

---

## 1. Product & Scope

### 1.1 AI Insight = simulasi/template, bukan live AI API
**Keputusan:** Insight dihasilkan dari pencocokan kondisi data ke template tersimpan (deterministik), bukan generation dari LLM/AI API beneran.
**Kenapa:** Fokus effort ke UX & data-modeling insight (kategori, impact, prioritas), bukan ke biaya/latency/reliability integrasi LLM asli — di luar scope waktu assessment.
**Trade-off:** Insight nggak bisa "mikir" di luar skenario yang udah ditulis manual (36 template: 4 kategori × 3 periode). Cukup buat demo produk, nggak representasi kapabilitas AI generatif asli.
*Sumber:* `business-plan.md` §9, `05-ai-insight-panel.md`.

### 1.2 Data ads (Meta/TikTok) = mock, bukan API platform asli
**Keputusan:** Semua angka spend/ROAS/closing/dst dikarang (mock generator), bukan hasil fetch dari Meta Graph API / TikTok Business API.
**Kenapa:** Nggak punya akses API resmi ke kedua platform (restriction/approval process yang nggak feasible dalam window assessment).
**Trade-off:** Nggak bisa demo integrasi OAuth/API pihak ketiga beneran. Dikompensasi lewat arsitektur data-layer yang siap-swap (lihat §3.3) — jadi limitasi akses dijawab dengan desain, bukan ditutupi.
*Sumber:* `business-plan.md` §9, `09-data-layer-wiring.md` §B.

### 1.3 Billing/payment = UI non-fungsional
**Keputusan:** Flow "Perpanjang Sekarang" & checkout Free→Pro cuma animasi 3-tahap (`setTimeout`), nggak ada payment gateway API apapun.
**Kenapa:** Payment gateway integration (Midtrans/Stripe/dst) adalah effort besar (sandbox setup, webhook, compliance) yang nggak nambah sinyal skill FE relevan buat assessment ini dibanding effort-nya.
**Trade-off:** Nggak ada demo real transaction flow. Dianggap acceptable karena assessment fokus ke FE architecture/UX, bukan payment infra.
*Sumber:* `business-plan.md` §3, §9.

### 1.4 Ticket/Support System dicoret dari scope
**Keputusan:** Fitur #8 awal (portal support/ticket) resmi dihapus, bukan cuma di-deprioritaskan.
**Kenapa:** Effort lebih baik dialokasikan ke core loop (connect→dashboard→insight) dan monetization (Billing) — support portal dianggap fitur operasional, nilai demo-nya rendah dibanding memperdalam AI layer.
**Trade-off:** Kalau assessor nanya "gimana handle user yang stuck", jawabannya "di roadmap", bukan "ada di produk".
*Sumber:* `business-plan.md` §9.

### 1.5 Mode Compare 2 Platform dicoret dari Detail Dashboard
**Keputusan:** Fitur bandingin Meta vs TikTok side-by-side (baik versi tabel maupun bar-chart) dihapus setelah dicoba dibangun.
**Kenapa:** Setelah di-prototype, kompleksitas UX (2 platform berdampingan) dianggap nggak sepadan dengan value buat audiens business owner (bukan analyst) — drill-down per-platform + tren performa dianggap lebih actionable.
**Trade-off:** Building block-nya (union metrik, highlight pemenang) masih ada di histori kalau mau di-rebuild nanti.
*Sumber:* `business-plan.md` §9.

---

## 2. Arsitektur & Stack

### 2.1 Next.js (bukan Vite SPA murni)
**Keputusan:** App Router Next.js 14, bukan Vite+React SPA (padahal referensi BDD.ai Client Service pakai Vite).
**Kenapa:** Lensa punya landing/pricing page public-facing yang butuh SSR/SEO buat akuisisi organik — beda dari BDD.ai yang full internal/authenticated. Next.js App Router juga kasih server actions sebagai BFF layer di depan Firebase Admin SDK nanti.
**Trade-off:** Kompleksitas App Router (server/client component boundary, routing convention) lebih tinggi dibanding Vite SPA polos — sepadan karena kebutuhan SSR nyata, bukan cargo-cult.
*Sumber:* `business-plan.md` §7.

### 2.2 Firebase (Auth/Firestore/Hosting) sebagai backend
**Keputusan:** Firebase dipilih ketimbang backend custom (Node/Express+Postgres, dst).
**Kenapa:** Prinsip "pilih profil infra paling kecil yang cukup" (diambil dari `02-deployment-policy` internal BDD, prinsipnya aja bukan literal) — nggak butuh backend custom buat scope CRUD user/business/insight-template yang relatif sederhana.
**Trade-off:** Vendor lock-in ke Firebase, query capability Firestore lebih terbatas dibanding SQL (nggak ada JOIN asli, dst) — acceptable buat data model yang emang sengaja sederhana.
*Sumber:* `business-plan.md` §7.

### 2.3 Route guard client-side only, bukan middleware + Admin SDK + session cookie
**Keputusan:** Proteksi route `(dashboard)` cukup via komponen client (`AuthGuard`) yang cek Zustand auth store, bukan Next.js middleware + Firebase Admin SDK + session cookie verification di server.
**Kenapa:** Middleware+Admin SDK adalah pola yang tepat buat production app beneran (proteksi di-edge, sebelum HTML ke-render), tapi overbuild buat prototype assessment single-review-cycle — nambah kompleksitas (secret management server-side, cookie refresh) tanpa nambah sinyal skill yang relevan dinilai.
**Trade-off:** Ada celah kecil: konten dashboard bisa sempat "ke-request" sebelum redirect client-side jalan (flash-of-protected-content minimal, karena `AuthGuard` return `null` saat belum resolve, bukan render anak). Nggak jadi masalah keamanan data karena data tetap difilter oleh Firestore security rules di server (bukan cuma proteksi UI).
*Sumber:* `09-data-layer-wiring.md` §A.5, `plan-2026-08-04-data-layer-wiring.md` Task 6.

---

## 3. Data Layer — Real vs Mock Boundary

### 3.1 Token session: memory (Zustand) + Firebase SDK persistence, bukan localStorage manual
**Keputusan:** `auth` store cuma nyimpen `User` object di memory; persistence antar-reload diserahin ke mekanisme internal Firebase SDK (IndexedDB), bukan `localStorage.setItem` manual.
**Kenapa:** localStorage rentan XSS (script apapun di halaman bisa baca token) — golden rule keamanan dasar, bukan preferensi gaya kode.
**Trade-off:** Nggak ada trade-off fungsional berarti — Firebase SDK udah handle refresh token secara otomatis, jadi ini murni upgrade keamanan tanpa ongkos UX.
*Sumber:* `00-auth-flow.md` poin 5.

### 3.2 Firebase Auth + Firestore = real integration (bukan mock)
**Keputusan:** Sign up/in/forgot-password dan data user/business/connected-platform status pakai Firebase SDK beneran, network call asli ke backend Google Cloud.
**Kenapa:** Ini bagian yang genuinely bisa di-build tanpa terhalang restriction API pihak ketiga — jadi dijadiin real, bukan ikut di-mock kayak ads data, biar ada demo integrasi backend service yang beneran jalan.
**Trade-off:** Butuh 1 project Firebase asli + `.env.local` terisi buat siapa pun yang mau jalanin dev server — nggak bisa "clone & run" tanpa setup akun Google dulu.
*Sumber:* `09-data-layer-wiring.md` §A, `plan-2026-08-04-data-layer-wiring.md`.

### 3.3 Ads metrics & AI insight: mock disajikan lewat Route Handler + TanStack Query, bukan static import
**Keputusan:** Generator mock dipindah ke server (`app/api/*/route.ts`), FE consume via `useQuery`/`useMutation` — bukan komponen import array statis langsung dari `mock-data.ts`.
**Kenapa:** Ini jawaban arsitektur buat keterbatasan akses API TikTok/Meta (§1.2) — kontrak request/response didesain supaya swap ke integrasi asli nanti = ganti isi handler doang, FE nggak kesentuh. Juga bikin loading/error/retry state di UI beneran teruji (delay + error-rate simulasi), bukan selalu happy path.
**Trade-off:** Effort lebih besar dibanding biarin static import (perlu bikin Route Handler, ubah komponen consumer, tulis test baru) — worth it karena ini poin utama buat nunjukin judgment arsitektur ke assessor, bukan sekadar "gabisa akses API jadi di-skip".
*Sumber:* `09-data-layer-wiring.md` §B (rencana, belum dieksekusi — plan terpisah dari Part A).

### 3.4 Ads mock data di-scope per `businessId` (seeded generator), BUKAN disimpan ke Firestore
**Keputusan:** Angka mock per bisnis di-generate deterministik dari seed `businessId` tiap request, bukan ditulis permanen ke Firestore.
**Kenapa:** Ditemukan sebagai gap: Business Switcher yang udah Firestore-backed (Part A) bikin ganti-bisnis kerasa nggak ngefek kalau angka dashboard tetep 1 dataset statis global. Tapi nyimpen fake data ke Firestore juga salah arah — bikin kabur batas "ini data yang didesain fake" jadi kayak model data backend asli, bertentangan sama keputusan §1.2 yang udah didokumentasikan sadar.
**Trade-off:** Angka mock nggak survive kalau nanti butuh "history" beneran (mis. audit trail data berubah dari waktu ke waktu) — acceptable karena bukan itu yang mau dibuktikan lewat mock data ini.
*Sumber:* `09-data-layer-wiring.md` §B poin 5.

### 3.5 Part B: slice fokus (KPI/PLATFORM_RAW + AI Insight), bukan full migrasi semua mock data
**Keputusan:** Cuma ads metrics (Overview KPI, Detail Platform per-platform metrics, ChannelChart, AI Insight live-anomaly) yang dipindah ke Route Handler + di-scope per `businessId`. `CAMPAIGNS`, `CREATIVES`, `TREND_DATA` (Campaign table, Creative list, chart tren 7/30 hari) tetap 1 dataset statis global, nggak ikut di-scope.
**Kenapa:** Full migrasi semua mock data ke Route Handler jauh lebih besar (~15-20 task) dan kebanyakan komponen consumer-nya bukan yang jadi masalah utama — gap yang beneran ditemukan (Business Switcher gak ngefek ke angka) itu spesifik di angka KPI/PLATFORM_RAW, bukan di daftar campaign atau chart tren. Fokus effort ke situ dulu, sepadan sama prinsip YAGNI — daripada overbuild semua sekaligus dan gak selesai.
**Trade-off:** Kalau ganti bisnis di switcher, Campaign table & Creative list & Trend chart masih nampilin data yang sama persis (nggak ikut berubah) — sementara KPI di atasnya berubah. Inkonsistensi ini nyata & keliatan kalau diperhatiin dengan teliti, tapi dianggap acceptable buat demo assessment; didokumentasikan di sini supaya bukan "bug yang gak disadari" kalau ditanya.
*Sumber:* `PROGRESS.md` sesi kesebelas (Part B).

### 3.6 AI Insight "Sync" = refetch platform-metrics, BUKAN endpoint kedua terpisah
**Keputusan:** Spec awal (`09-data-layer-wiring.md` §B poin 3) nyebut logic insight-matching "dibungkus jadi endpoint/Server Action sendiri". Pas eksekusi, ini disederhanakan: nggak ada endpoint `/api/insight` baru — tombol "Sync & Analisis Ulang" cukup invalidate query `platform-metrics` yang udah ada (yang datanya dipakai buat live-anomaly card), matching logic-nya sendiri tetap jalan pure/instant di client.
**Kenapa:** Insight-matching logic (`insight-matcher.ts`) itu deterministik & instant (nggak ada I/O), gak ada alasan teknis buat mindahin ke server selain ceremony ngikutin spec kata-per-kata. Endpoint yang beneran nyelesain masalah (angka platform yang di-scope per bisnis) udah ada di `platform-metrics` — itu yang dipanggil ulang.
**Trade-off:** Nggak 100% sama persis kayak yang ditulis di spec awal — tapi ini penyimpangan yang didokumentasikan sadar (bukan silently berubah pikiran), dan hasil akhirnya (tombol Sync beneran nge-refetch data asli, bukan cuma timer) tetap tercapai.
*Sumber:* `PROGRESS.md` sesi kesebelas (Part B).

---

## 4. Tooling & Build

### 4.1 shadcn CLI dipin ke `@2`, bukan `@latest`
**Keputusan:** Selalu `npx shadcn@2 add <component>`, nggak pernah `npx shadcn@latest`.
**Kenapa:** `@latest` generate kode Tailwind-v4-oriented (`oklch()`, `@base-ui/react`, arbitrary-value syntax) yang nggak compile di project ini (masih Tailwind v3.4.1) — ini bug build nyata yang kejadian pas Task 5 sesi awal, bukan preferensi.
**Trade-off:** Harus manual reconcile `tailwind.config.ts`/`globals.css` tiap nambah component baru (CLI `@2` masih suka nulis duplicate `:root` block) — 4-langkah checklist wajib tiap kali, didokumentasikan biar nggak keulang bug-nya.
*Sumber:* `31-frontend-nextjs.md` (bagian "Adding new shadcn/ui components").

### 4.2 State: TanStack Query buat server state, Zustand cuma 2 store (`ui` + `auth`)
**Keputusan:** Nggak ada Redux/Context API buat state management umum. Server state (data dari Firestore/API) wajib lewat TanStack Query, bukan `useState`+`useEffect` manual atau taro di Zustand.
**Kenapa:** Pemisahan tegas server-state vs client-state — TanStack Query kasih caching/loading/error/retry gratis buat data dari luar, Zustand cukup buat state UI murni (modal terbuka, bisnis aktif). Nyampur keduanya (server data di Zustand) bikin cache invalidation manual & gampang stale.
**Trade-off:** Sedikit lebih banyak boilerplate (query key management) dibanding taro semua di 1 store — sepadan buat konsistensi & correctness data-fetching di app yang makin banyak sumber data (Firestore + nanti Route Handler mock API).
*Sumber:* `31-frontend-nextjs.md`.

---

## 5. Pola Kode yang Berulang (worth diingat, bukan cuma sekali pakai)

### 5.1 Reuse logic/komponen lintas fitur, bukan duplikasi
**Contoh:** `AiInsightSpotlight` di landing page reuse `InsightCard` + `getInsightsForPeriod` asli dari fitur AI Insight (bukan markup/logic duplikat). Proactive Alert Card di Overview & kartu anomali #1 di AI Insight sama-sama dituntun dari `shouldShowProactiveAlert()` — 1 sumber logic, 2 tempat pakai.
**Kenapa jadi prinsip, bukan kebetulan:** Kalau logic/threshold berubah, cukup 1 tempat — juga jadi bukti concrete komponen di-desain dengan boundary yang jelas (bisa di-reuse tanpa modifikasi), bukan cuma "kelihatan modular" di kertas.
*Sumber:* `PROGRESS.md` sesi 5 & sesi 9.

### 5.2 Angka gabungan lintas-platform dihitung ulang dari raw data, bukan rata-rata naif dari angka per-platform
**Keputusan:** KPI gabungan Overview (ROAS/CPA/CTR) di-derive dari `PLATFORM_RAW` (spend-weighted buat ROAS, dihitung ulang dari total buat CPA/CTR) — bukan `average(platformA.roas, platformB.roas)`.
**Kenapa:** Rata-rata naif dari rasio (ROAS/CPA/CTR) itu salah secara matematis kalau spend per-platform beda jauh — ditemukan sebagai bug nyata pas audit sesi 10 (KPI Overview sebelumnya di-hardcode terpisah dari angka per-platform, jadi nggak provably "gabungan").
**Trade-off:** Nggak ada — ini murni fix correctness, bukan trade-off desain.
*Sumber:* `PROGRESS.md` sesi 10.

---

## 6. Testing Strategy

### 6.1 Automated test suite dihapus, andalkan manual testing
**Keputusan:** Semua 36 file test (`*.test.ts(x)`, 97 test) dihapus dari `lensa-app` di sesi kesebelas — termasuk test yang baru ditulis di sesi yang sama buat Part A wiring (TDD sempat dipakai penuh buat 8 task itu, lalu test-nya dihapus setelah task-nya selesai & di-commit).
**Kenapa:** Keputusan user — dianggap di luar scope yang perlu buat assessment ini, dan manual testing dirasa cukup buat prototype single-review-cycle ini.
**Trade-off:** Nggak ada regression safety net otomatis lagi — perubahan di 1 fitur bisa diam-diam break fitur lain tanpa ketahuan sampe di-manual-test. Test infra (vitest config, `@testing-library/*`/`vitest`/`msw` di `devDependencies`, `src/test/setup.ts`, `npm test` script) sengaja **dibiarin ada** (bukan di-uninstall) — gampang ditulis ulang test-nya kalau kebutuhan berubah, tanpa perlu setup ulang dari nol.
**Catatan buat presentasi:** Kalau ditanya assessor "kok gak ada test", jawabannya bukan "gak sempet" — ini keputusan sadar, dan proses TDD-nya sendiri (RED→GREEN tiap task) tetap kepake selama development Part A, cuma artifact test-nya dibuang belakangan. `git log` (commit sebelum penghapusan) masih nunjukin history test yang pernah ada kalau perlu ditunjukin.
*Sumber:* `PROGRESS.md` sesi kesebelas.

---

## Cara pakai file ini nanti (buat presentasi)

Tiap section di atas = 1 jawaban siap pakai buat pertanyaan tipe "kenapa kamu pilih X, bukan Y" pas assessment. Kalau ditanya soal *implementasi* detail (bukan *kenapa*), rujuk `plan-*.md` yang relevan (isinya kode lengkap + commit history per task). Kalau ditanya soal *kronologi* kerjaan (apa yang dikerjain sesi mana), rujuk `PROGRESS.md`.
