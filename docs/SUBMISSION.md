# Lensa — Submission Write-up (BDD Assessment, Sr. Frontend)

> Dokumen ini nyusun ulang & mensintesis apa yang udah terdokumentasi di `business-plan.md`, `decisions-log.md`, dan `PROGRESS.md` jadi 1 narasi sesuai 6 poin yang diminta buat submission. Tiap klaim di sini bisa ditelusuri balik ke source doc yang lebih detail (ditandai *Sumber* di tiap bagian) — dokumen ini bukan gantiin dokumen sumbernya, cuma jadi entry point buat reviewer.

---

## 1. Produk yang Dipilih & Referensi

**Produk:** Lensa — dashboard performa iklan omni-channel berbasis AI, dibangun sebagai prototype untuk BDD Assessment (Sr. Frontend).

**Referensi:** **BDD.ai Client Service.** Sama-sama berada di ruang *ads/marketing analytics aggregation* — masalah intinya sama: data performa iklan tersebar di banyak dashboard platform berbeda, dan sulit dapet gambaran + insight gabungan yang actionable. Struktur arsitekturnya juga mirip secara prinsip: connect account per platform → dashboard per platform → summary/blend view.

Yang membedakan Lensa dari referensinya (lihat tabel lengkap di `business-plan.md` §6):

| | BDD.ai Client Service | Lensa |
|---|---|---|
| **Audience** | DM/AM yang kelola banyak client sekaligus (perlu switch antar client) | Pemilik bisnis sendiri (self-serve), langsung dipakai buat bisnisnya sendiri |
| **Business model** | Kemungkinan internal/enterprise tool | Subscription SaaS self-serve (Free/Pro) |
| **Level bahasa/UX** | Power-user yang familiar istilah marketing teknis | Business owner awam — insight diterjemahkan ke bahasa bisnis sehari-hari, bukan jargon |
| **Scope fitur** | Lengkap (7+ channel, custom report builder, budget tracker) | Ramping — fokus channel utama (Meta+TikTok) + insight yang tajam |

*Sumber: `business-plan.md` §1-2, §6.*

---

## 2. Pendekatan yang Diambil

**Option A — Build new product**, bukan reimagine produk yang sudah ada, dan bukan fork dari codebase yang sudah ada.

**Kenapa bukan reimagine:** BDD.ai Client Service adalah tool internal/enterprise — nggak ada akses ke UX aslinya buat dikritik-dan-diperbaiki secara langsung, jadi "reimagine" nggak applicable secara literal. Yang bisa dilakukan adalah belajar dari *pola arsitektur & masalah intinya* (connect→dashboard→insight), lalu desain ulang untuk audiens & model bisnis yang beda total.

**Kenapa bukan fork:** Nggak ada codebase open-source yang pas buat problem space spesifik ini (self-serve SME ads aggregator + AI insight bahasa bisnis) untuk di-fork dan di-extend secara bermakna dalam window waktu assessment.

**Kenapa build new:** Membangun produk baru dari nol ngasih kontrol penuh buat nge-scope fitur sesuai window waktu assessment, sambil tetap punya titik pembanding yang konkret (BDD.ai) buat menjustifikasi tiap keputusan produk — bukan desain di ruang hampa. Ini juga jadi kesempatan eksplorasi proses AI-assisted development versi sendiri (lihat §6) — `business-plan.md` §8 mencatat BDD.ai sendiri sudah punya sistem subagent internal (dibuat supervisor), dan project ini sengaja dipakai buat explore pendekatan sendiri, bukan meniru itu.

*Sumber: `business-plan.md` (judul dokumen + §8).*

---

## 3. Perubahan User Flow, Fitur Baru, & Konsep Produk

### 3.1 Core loop
Sign Up/Sign In → **Onboarding** (business setup) → **Binding** (connect platform) → Overview → Detail Platform → AI Insight.

**Perubahan mid-project yang signifikan:** Onboarding & Binding awalnya **1 layar gabungan** (pilih platform sekaligus jadi "syarat masuk" dashboard). Setelah dipakai, ketauan konsepnya ketuker: "punya bisnis" dan "connect platform" itu 2 concern yang beda, tapi kerasa numpuk jadi 1 formalitas sign-up. Dipisah total: Onboarding sekarang murni business setup (nama+kategori bisnis, 0 konten platform sama sekali), Binding jadi halaman/nav item sendiri buat connect platform, dengan confirm dialog sebelum simulasi bind ("Binding ke X? ... permanen sampe upgrade"). Ini contoh product-thinking pivot yang keluar dari observasi pemakaian, bukan dari rencana awal. *(`PROGRESS.md` sesi keempatbelas — "restrukturisasi besar".)*

### 3.2 Monetisasi Free/Pro & rationale
- **Free:** 1 bisnis, 1 platform (Meta *atau* TikTok, dipilih salah satu), AI Insight dasar.
- **Pro:** multi-bisnis, unlimited platform, full AI Insight, export.

Draf awal Free dapat **2 platform** — sengaja **dipersempit ke 1** biar gap benefit ke Pro lebih tegas & realistis buat model freemium (`business-plan.md` §3). Keputusan terkait yang juga direvisi di tengah jalan: awalnya user Free bisa **swap** platform kapan saja (klik platform terkunci → tawaran ganti/upgrade) — ini dianggap merusak value gap ke Pro (bebas ganti platform bikin batasan "1 platform" kerasa nggak beneran ngebatasin apa-apa). Fix: **binding Free sekarang permanen**, cuma upgrade ke Pro yang bisa buka platform kedua.

### 3.3 AI Insight — evolusi terbesar di produk ini
Ini bagian yang paling banyak iterasi product-thinking, jadi worth ditelusuri urutannya:

1. **V1:** kartu insight per kategori (Anomali/Rekomendasi/Positif), badge Impact, panel "Rekomendasi Prioritas", Benchmark Industri, Rekomendasi Alokasi Budget.
2. **Free-tier gating (beberapa iterasi):** awalnya full-lock kategori non-Positif → direvisi jadi blur konten → direvisi lagi jadi lock per-section (bukan blur per-kata, dianggap kurang pas secara visual) → **direvisi lagi malam ini**: "Ringkasan" (Total Insight) dan "Rekomendasi Prioritas" dibuka jadi **free buat semua plan** (dianggap teaser nilai AI, bukan bagian yang layak di-lock), cuma grid "Semua Insight" (browsing lengkap tiap kategori) yang tetap Pro-only. Iterasi berkali-kali ini nunjukin trade-off nyata: gimana narik garis antara "kasih cukup value biar Free ngerasa AI-nya beneran berguna" vs. "tetap kasih alasan kuat buat upgrade ke Pro."
3. **Rombak visual total (malam ini):** halaman yang tadinya numpuk (4 section penuh tampil sekaligus) dipecah jadi kartu ringkasan gabungan + panel prioritas + 2 tab ("Semua Insight" / "Benchmark & Budget"). Kartu insight disederhanain dari 3 badge (kategori/platform/impact) jadi border kiri berwarna + 1 indikator impact, biar nggak berasa "wall of chips".
4. **Reframing bahasa & konten** dari nada "deteksi anomali" (klinis, agak menakutkan buat business owner awam) ke nada **rekomendasi aksi**: kategori "Anomali" di-rename jadi **"Perlu Aksi"**; setiap insight yang tadinya cuma nge-link "Lihat Overview/Platform →" (nyuruh user pergi cek sendiri) diganti jadi rekomendasi aksi self-contained di dalam card ("Tandai sudah ditinjau/diterapkan/dilihat", beda per kategori) — pergeseran dari "AI kasih tau ada yang aneh" ke "AI kasih tau kamu harus ngapain".
5. **Simulasi "hidup"**: tombol "Sync & Analisis Ulang" awalnya cuma update timestamp doang (sesuai spek asli) — ditambah simulasi insight baru yang beneran terakumulasi tiap klik (bukan cuma ganti 1 item, sempet ada bug di iterasi pertama yang bikin angka kelihatan statis — root cause & fix ada di `PROGRESS.md`), biar interaksi "sync" terasa kasih hasil, bukan cuma kosmetik.

*Sumber: `feature-specs.md` §05, `business-plan.md` §3/§5, `PROGRESS.md` sesi keempatbelas (banyak entry berurutan).*

### 3.4 Scope yang sengaja dipotong (dan kenapa)
- **Compare 2 Platform** (Detail Dashboard): dicoba dibangun, lalu dicoret — kompleksitas UX 2-platform-berdampingan dianggap nggak sepadan sama value buat audiens business owner (bukan analyst); drill-down per-platform + tren performa dianggap lebih actionable.
- **Ticket/Support System:** dicoret total dari scope — effort lebih baik dialokasikan ke core loop + monetization + memperdalam AI layer, dibanding fitur operasional yang nilai demo-nya rendah.
- **Campaign management table** (Overview & Detail Platform): sempat dibangun, lalu **dihapus** setelah refleksi — tabelnya cuma nampilin data statis tanpa aksi kelola apapun, jadi bukan fitur beneran, cuma "kelihatan lengkap". KPI "Campaign Aktif" (angka doang) tetap ada karena itu genuinely metrik hitungan, bukan klaim fitur manajemen.
- **Team/permission per bisnis:** di luar scope dari awal, dicatat sebagai roadmap next.

*Sumber: `business-plan.md` §9, `decisions-log.md` §1.4-1.5.*

---

## 4. Keputusan Teknis

> Rangkuman sintesis — detail lengkap tiap keputusan (kenapa + trade-off) ada di `decisions-log.md`, disusun per topik.

**Arsitektur & stack:**
- **Next.js 14 App Router**, bukan Vite SPA murni (padahal referensi BDD.ai pakai Vite) — Lensa punya landing+pricing page public-facing yang butuh SSR/SEO buat akuisisi organik, beda dari BDD.ai yang full internal/authenticated.
- **Firebase (Auth/Firestore)** sebagai backend, bukan backend custom — prinsip "pilih profil infra paling kecil yang cukup" buat scope CRUD user/business/insight-template yang relatif sederhana. Trade-off: vendor lock-in + query capability Firestore terbatas (nggak ada JOIN asli), diterima karena data model memang sengaja sederhana.
- **Route guard client-side** (komponen `AuthGuard` cek Zustand store), bukan Next.js middleware + Firebase Admin SDK + session cookie — dianggap overbuild buat prototype single-review-cycle. Data tetap aman karena difilter oleh Firestore security rules di server, bukan cuma proteksi UI.
- **State:** TanStack Query buat semua server state, Zustand cuma 2 store (`ui`, `auth`) — pemisahan tegas server-state vs client-state biar nggak ada cache invalidation manual/stale data.

**Data layer — batas real vs mock (keputusan paling nuanced di project ini):**
- Auth + identitas user/bisnis/connected-platform → **100% Firebase asli**, network call beneran (bukan ikut di-mock), karena ini bagian yang genuinely bisa dibangun tanpa terhalang restriction API pihak ketiga.
- Ads metrics (spend/ROAS/closing/dst) → **mock/seeded generator**, karena nggak ada akses API resmi Meta/TikTok dalam window assessment. **Yang penting:** limitasi ini dijawab lewat desain arsitektur, bukan ditutupi — mock disajikan lewat Route Handler (`app/api/platform-metrics`) + TanStack Query (bukan static import array), jadi kontrak request/response udah didesain siap-swap ke integrasi asli nanti (ganti isi handler doang, FE nggak kesentuh). Data mock di-seed deterministik dari `businessId` per-request (bukan ditulis ke Firestore) — biar Business Switcher tetep ngefek ke angka, tapi nggak mengaburkan batas "ini data fake" jadi kayak data backend asli.
- AI Insight → simulasi/template (pencocokan kondisi data ke bank skenario tertulis, deterministik), bukan live LLM call — fokus effort ke UX & data-modeling insight (kategori, impact, prioritas), bukan ke biaya/latency/reliability integrasi LLM asli.

**Tooling gotcha yang worth dicatat:** `npx shadcn@latest` generate kode Tailwind v4 (`oklch()`, dst) yang nggak compile di project ini (Tailwind v3.4.1) — bug build nyata yang ketemu pas nambah komponen pertama kali, sekarang di-pin ke `npx shadcn@2` + checklist manual reconcile token warna tiap nambah komponen baru.

**Testing strategy:** Automated test suite (36 file, 97 test) **sengaja dihapus** di tengah project (keputusan user, bukan kelupaan) — dianggap di luar scope yang perlu buat prototype single-review-cycle ini, manual testing (`tsc`+`build`+smoke test) dirasa cukup. Test infra (vitest config, `@testing-library/*`, `src/test/setup.ts`) sengaja **dibiarin terpasang** — gampang ditulis ulang kalau kebutuhan berubah. TDD (RED→GREEN per task) tetap dipakai penuh selama fase data-layer wiring sebelum test-nya dibuang — proses disiplinnya kepake, cuma artifact-nya nggak dipertahankan.

**Bug nyata yang ketemu & difix selama proses** (bukti proses review beneran jalan, bukan cuma klaim): kesalahan hitung persentase test, nested `<b>` yang bikin test-matcher gagal cocokin teks (2x kejadian), `TargetTracker` yang jadi konstanta beku (Set Target nggak update tampilan — stale snapshot bug), rata-rata naif dari rasio (ROAS/CPA/CTR gabungan dihitung `average()` padahal harus di-derive ulang dari raw data — matematis salah kalau spend per-platform beda jauh), beberapa gap lintas-task yang cuma ketauan pas *whole-branch review* (bukan per-task review) — misal Business Switcher yang nggak persist antar reload, `CoverageBanner` hardcode jumlah platform.

*Sumber: `decisions-log.md` (semua §), `09-data-layer-wiring.md`, `10-data-flow-reference.md`.*

---

## 5. Catatan Deployment

- **Live URL:** https://lensa-app-eight.vercel.app
- **Platform:** Vercel (Next.js zero-config, Route Handler `/api/platform-metrics` jalan sebagai serverless function tanpa ubah config apapun).
- **Auto-deploy:** Vercel project connect ke GitHub (`main` branch) — **dikonfirmasi lewat GitHub commit status API** (`gh api repos/.../commits/<sha>/status`) bahwa setiap commit sampai yang paling akhir sukses auto-deploy. Nggak perlu langkah redeploy manual tiap kali ada perubahan.
- **Firebase setup:** Project Firebase asli (bukan placeholder), 6 env var `NEXT_PUBLIC_FIREBASE_*` di-set baik di `.env.local` (lokal) maupun Vercel production env. `firestore.rules` ditulis di repo **dan sudah di-publish** ke Firebase Console. Domain Vercel terdaftar di Firebase Authentication → Authorized Domains — dikonfirmasi (implisit) lewat retest sign-up/login yang sukses di domain live tersebut (kalau domain nggak authorized, login bakal gagal total dengan `auth/unauthorized-domain`, bukan sebagian jalan).
- **Insiden yang pernah kejadian & di-fix:** sempat error `auth/invalid-api-key` di awal deploy karena env var Firebase belum ke-set di Vercel sama sekali — fix: push env var + force redeploy.
- **Keterbatasan keamanan yang disadari & diterima (bukan di-fix, didokumentasikan eksplisit):** rule Firestore `businesses/{id}` sekarang ngebolehin owner update field apapun termasuk `plan` — user teknisnya bisa self-upgrade ke Pro dari devtools tanpa lewat Billing. Diterima sebagai keterbatasan client-only Firestore rules — enforcement asli butuh Cloud Functions/Admin SDK, di luar scope assessment ini (konsisten sama keputusan "bukan payment gateway fungsional").
- **Jalanin lokal:** `npm install` → `npm run dev`, butuh project Firebase asli + `.env.local` terisi (lihat `.env.local.example`) supaya Auth/Firestore beneran jalan. Tanpa itu, halaman publik & UI tetap bisa dilihat tapi sign up/sign in gagal.
- **Verifikasi standar tiap perubahan:** `npx tsc --noEmit` (type check) + `npm run build` (production build — verifikasi utama project ini, nggak ada test suite otomatis) + `npm run lint`.

*Sumber: `PROGRESS.md` sesi ketigabelas/keduabelas, `README.md`.*

---

## 6. Catatan Penggunaan AI

Bagian ini soal 2 hal yang beda: (A) gimana AI (Claude Code) dipakai buat **membangun** project ini, dan (B) gimana AI jadi **fitur di dalam produknya sendiri** (AI Insight).

### 6.A AI sebagai alat development

Seluruh project ini dibangun pakai **Claude Code** (CLI agent Anthropic) sebagai eksekutor — bukan cuma autocomplete. Developer (saya) yang nentuin scope/keputusan produk, review output, dan ambil keputusan trade-off akhir; Claude Code yang nulis kode, jalanin build/lint, dan verifikasi diri sendiri (`tsc`+`build`) tiap selesai perubahan.

**2 mode kerja dipakai secara sengaja, tergantung taruhan (stakes) dari pekerjaannya:**

1. **Mode terstruktur** (brainstorm → tulis plan → eksekusi TDD lewat subagent, dengan reviewer subagent independen tiap task) — dipakai buat slice paling besar/berisiko: UI-slicing Phase 0/1 awal (6 plan file, 19 task), wiring data-layer Part A/B, dan "Dashboard Revamp" 7-fase. Tiap task lewat 2 pasang mata (implementer subagent → reviewer subagent independen) sebelum dianggap selesai — proses ini yang beneran nemuin bug nyata (lihat §4), bukan cuma teori.
2. **Mode langsung/ringan** — dipakai setelah trust ke tool + familiarity sama konvensi codebase udah terbentuk, dan buat perubahan yang lebih kecil & dipahami jelas scope-nya (sebagian besar kerjaan AI Insight malam ini: rombak visual, rename bahasa, rework gating, fitur simulasi sync). Iterasi lebih cepat, tapi tetap diverifikasi `tsc`/`lint`/`build` tiap perubahan — nggak pernah dianggap "selesai" cuma dari klaim modelnya sendiri.

**4 subagent khusus** dibangun buat project ini (`.claude/agents/`): `lensa-orchestrator` (cek scope ke `business-plan.md` sebelum delegasi), `lensa-fe-builder` (nulis komponen sesuai spek fitur), `lensa-design-consistency` (jaga konsistensi visual ke `design-system.md`), `lensa-reviewer` (gate akhir sebelum fitur dianggap selesai). Ini eksplorasi sengaja — `business-plan.md` §8 mencatat BDD.ai sendiri udah punya sistem subagent internal (dibuat supervisor); project ini dipakai buat coba desain versi sendiri dengan pendekatan role→doc alignment, buka kemungkinan nemu pendekatan yang beda/lebih pas.

**`docs/AGENTS.md`** jadi guard-rail yang wajib dibaca subagent apapun sebelum kerja — aturan eksplisit: kalau request kelihatan di luar scope (misal fitur team-permission, payment gateway fungsional), **STOP dan tanya**, jangan langsung build. Ini beneran dipakai berkali-kali (misal nge-flag "Compare 2 platform" dan permintaan campaign-management ke `business-plan.md` §9 sebelum lanjut).

**Dokumentasi sebagai "memory" lintas-sesi:** daripada jelasin ulang konteks project tiap sesi baru, `CLAUDE.md` + `docs/*.md` (business-plan, feature-specs, decisions-log, `PROGRESS.md`) jadi hal pertama yang dibaca sesi Claude Code manapun sebelum kerja. `PROGRESS.md` khususnya berfungsi sebagai hub kronologis — bikin kerjaan bisa lanjut koheren lintas banyak sesi/hari terpisah, tanpa harus 1 chat session yang hidup terus-menerus.

**Disiplin verifikasi (bagian paling penting dari cerita "AI leverage" ini):** beberapa kali dilakukan audit balik ke kode asli — bukan percaya klaim `PROGRESS.md` sendiri begitu aja. Contoh: audit ulang 20 item brainstorming lawas via fork paralel, dan audit ulang checklist acceptance criteria `feature-specs.md` §00-08 via 7 fork paralel independen — keduanya nemu gap nyata (walau kecil) yang langsung difix. Prinsipnya: **AI mempercepat throughput produksi kode, tapi disiplin verifikasi (build-check tiap perubahan, reviewer subagent independen, audit ulang periodik ke kode asli) yang bikin hasilnya bisa dipercaya** — bukan percaya buta ke output sekali generate.

### 6.B AI sebagai fitur di dalam produk (AI Insight)

AI Insight sengaja **simulasi/template** (pencocokan kondisi ke bank skenario tertulis, deterministik), bukan live LLM call — keputusan sadar yang didokumentasikan eksplisit (`business-plan.md` §9), bukan keterbatasan yang disembunyikan. Tapi didesain dengan *seam* integrasi yang nyata: logic pencocokan (`insight-matcher.ts`) terisolasi & deterministik, jadi kalau nanti mau di-swap ke live LLM call, yang disentuh cuma 1 boundary itu, bukan seluruh fitur.

Rombak malam ini (lihat §3.3) mempertegas arah produknya: dari "AI kasih tau ada yang aneh" (nada deteksi-anomali, agak klinis) jadi "AI kasih tau kamu harus ngapain" (nada rekomendasi aksi, bahasa bisnis) — ini yang paling relevan buat audiens business owner awam yang jadi target Lensa, dan jadi contoh konkret gimana "AI Leverage" di sebuah produk bukan cuma soal "ada AI-nya", tapi soal AI-nya beneran ngomong dengan cara yang berguna buat orang yang makenya.

*Sumber: `AGENTS.md`, `PROGRESS.md` (seluruh sesi), `decisions-log.md` §1.1.*
