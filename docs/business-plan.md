# Lensa — Business Planning Summary
*Prototype konsep untuk BDD Assessment (Sr. Frontend) — Option A: Build new product, referensi BDD.ai Client Service*

---

## 1. Nama & Positioning

**Nama produk:** Lensa

**Tagline (pilihan):**
- "Satu Lensa untuk Semua Channel Iklanmu"
- "Lihat Bisnismu Lebih Jernih"
- "Fokus ke Bisnis, Bukan ke Banyak Dashboard"

**Positioning Statement:**
> Untuk pemilik bisnis yang jualan di lebih dari satu platform (misal Meta Ads + TikTok Ads) dan kesulitan mantau performa iklan karena datanya kececer di banyak dashboard terpisah — **Lensa** adalah platform dashboard performa iklan omni-channel berbasis AI yang menggabungkan semua data jadi satu tampilan yang jernih dan gampang dipahami, tanpa perlu jadi expert marketing buat ngerti apa yang harus dilakuin selanjutnya. Beda dari native ads manager tiap platform yang cuma nunjukin data mentah per-channel, Lensa kasih insight lintas-platform yang actionable, ditulis dalam bahasa bisnis — bukan jargon marketing.

---

## 2. Target User & Problem

- **Target:** Pemilik UMKM/SME yang jualan multi-channel (social commerce + marketplace ads) — misal punya toko baju yang jalanin ads di Meta sekaligus TikTok.
- **Problem:** Data performa iklan tersebar di banyak dashboard platform berbeda; business owner (yang belum tentu paham istilah marketing teknis) kesulitan dapet gambaran utuh & actionable insight dari data yang terpisah-pisah.
- **Solusi:** Satu dashboard yang menggabungkan data dari semua platform + AI yang menerjemahkan data jadi insight bahasa bisnis.

---

## 3. Business Model

- **Tipe:** SaaS subscription (recurring revenue), self-serve.
- **Tier:**
  - **Free** — 1 bisnis, bisa connect **1 platform** (pilih salah satu: Meta Ads *atau* TikTok Ads), 1 pengguna (tanpa invite tim), AI Insight dasar (kategori Positif saja), histori data 7 hari, tanpa export & tanpa multi-bisnis. *(Revisi dari draf awal yang 2 platform — sengaja dipersempit biar gap benefit ke Pro lebih tegas & realistis buat model freemium.)*
  - **Pro** — bisa punya lebih dari 1 bisnis (multi-business switcher aktif) + unlimited platform (katalog saat ini maksimal 4: Meta Ads, TikTok Ads, Google Analytics, Marketplace Ads — di mockup baru Meta Ads & TikTok Ads yang benar-benar terhubung, GA & Marketplace Ads masih dicatat sebagai katalog masa depan) + full AI insight + export.
- **Value metric:** jumlah bisnis yang dikelola / jumlah platform terkoneksi.
- **Halaman paket** dibangun sebagai sub-tab **"Paket Tersedia" di dalam Billing** (bukan halaman "Pricing" terpisah di nav) — murni perbandingan Free vs Pro, mock data, tanpa payment gateway fungsional. Billing juga punya simulasi **"Perpanjang Sekarang"** — modal 3-tahap (konfirmasi → animasi "menghubungkan ke payment gateway" → sukses) buat alur *renewal* langganan Pro yang sudah aktif. Ini tetap 100% simulasi client-side (`setTimeout`, tanpa API call apapun) — bukan pelanggaran terhadap keputusan "bukan payment gateway fungsional", cuma lebih detil animasinya dari draf awal. Alur *upgrade* Free→Pro yang dipicu dari limit-gate (mis. di Business Switcher pas nambah bisnis ke-2) **belum dibangun** di mockup ini.

---

## 4. Scope Struktur Akun

- **1 user account bisa punya multiple bisnis** (misal Fashion + F&B), switch via **business switcher di sidebar**.
- **1 bisnis = bisa connect ke multiple platform ads** — katalog saat ini: Meta Ads, TikTok Ads, Google Analytics, Marketplace Ads (maks 4).
- **Tidak termasuk dalam scope:** multi-user/team permission per bisnis (siapa yang boleh akses apa) — dicatat sebagai roadmap next, tidak dibangun.
- **Tidak termasuk dalam scope:** flow pricing/payment/billing fungsional — cukup disebut sebagai konteks model bisnis di write-up.

---

## 5. Fitur Inti (Prototype)

| # | Fitur | Catatan |
|---|---|---|
| 1 | **Connect Platform (Onboarding)** | List view (bukan card grid), simulasi connect Meta Ads & TikTok Ads dengan checklist icon |
| 2 | **Business Switcher** | Di sidebar, switch antar bisnis milik user yang sama, Pro = unlimited bisnis |
| 3 | **Overview/Summary Dashboard** | Blend data lintas platform — total spend, total closing/konversi, ROAS gabungan, CPA, CTR, impresi, klik, campaign aktif + tombol **Sync** + info cakupan platform ("X dari Y platform sudah tercakup") |
| 4 | **Per-Platform Detail Dashboard** | Drill-down per platform (switcher chip), metrik per platform + persentase perubahan (gaya KPI Overview), plus chart **Tren Performa** (Spend/Closing, 7 hari). ~~Mode Compare 2 Platform~~ **dihapus dari scope** — lihat §9. |
| 5 | **AI Insight Panel** | Kesimpulan & saran lintas-platform, disimulasikan/di-template (bukan live API); tombol **Sync & Analisis Ulang** + filter periode (kemarin/1 bulan/3 bulan) dengan perbandingan antar-periode + filter platform. Diperluas dengan: badge **Impact** (Tinggi/Sedang/Rendah) per insight, estimasi dampak kuantitatif, panel **"Rekomendasi Prioritas"** (ringkasan 2-3 aksi yang sebaiknya dilakukan duluan), dan feedback 👍/👎 per insight. |
| 6 | **Proactive Alert/Anomaly Card** | AI notice kalau ada anomali data (mis. spend naik tapi closing stagnan) |
| 7 | **Insight Card / Export** | "Copy as Report" — chart + 1-baris kesimpulan AI + branding, buat di-share. *(Di mockup HTML: modal preview teks statis, belum render `html2canvas` sungguhan — deferred ke build Next.js.)* |
| 8 | ~~**Ticket/Support System**~~ | **Dihapus dari scope** — lihat §9. |
| 9 | **Last Synced Indicator** | Timestamp update data terakhir, bangun trust |
| 10 | **Empty State / First-time Experience** | Onboarding list sebelum ada platform yang di-connect |
| 11 | **Billing / Paket Page** | Sub-tab "Paket Tersedia" di dalam Billing (bukan nav terpisah "Pricing"), mockup Free vs Pro + simulasi "Perpanjang Sekarang" (payment-gateway-style modal, tetap non-fungsional) |

**Urutan build:** Dashboard layout + 1 platform view (paling polished) → AI Insight panel → infra (Firebase) woven throughout → docs/standards hub di akhir.

---

## 6. Kesamaan & Perbedaan dengan BDD.ai (Client Service)

**Kesamaan:**
- Sama-sama di ruang ads/marketing analytics aggregation — masalah inti sama: data iklan tersebar di banyak platform, susah dapet insight gabungan.
- Struktur arsitektur mirip: connect account per platform → dashboard per platform → summary/blend view.
- Sama-sama ada ruang untuk AI insight layer sebagai differentiator (BDD.ai belum punya ini).

**Perbedaan:**
- **Audience:** BDD.ai dipakai DM/AM untuk kelola banyak client sekaligus (perlu switch antar client). Lensa = self-serve, langsung dipakai pemilik bisnis sendiri.
- **Business model:** BDD.ai kemungkinan internal/enterprise tool. Lensa = subscription SaaS self-serve.
- **Level bahasa/UX:** BDD.ai untuk power-user yang familiar istilah marketing teknis. Lensa untuk business owner awam — AI insight-nya menerjemahkan ke bahasa bisnis sehari-hari.
- **Scope fitur:** BDD.ai lengkap (7+ channel, custom report builder, budget tracker). Lensa lebih ramping — fokus channel utama + insight tajam.

---

## 7. Landasan Teknis

- **Kenapa Next.js, bukan Vite SPA murni:** Lensa punya sisi public-facing (landing + pricing page) yang idealnya SSR/SEO-friendly untuk akuisisi organik business owner — beda dari BDD.ai Client Service yang full internal/authenticated (makanya Vite cukup di sana). Next.js App Router juga kasih server actions sebagai BFF layer di depan Firebase Admin SDK (secret tetap di server). Next.js juga stack harian yang sudah dikuasai, jadi build velocity lebih tinggi dalam window waktu assessment.
- **Stack FE:** Next.js 14 App Router + TS strict, Tailwind + **shadcn/ui**, Zustand (minim store: `ui` + `auth`), TanStack Query (server state), Zod (validasi), **Recharts** (basis shadcn charts, visual konsisten), Framer Motion, Firebase (Auth/Firestore/Hosting).
- **Infra:** Single Next.js app repo + Firebase (Auth/Firestore/Hosting) sebagai backend terkelola — ringan, sesuai prinsip "pilih profile paling kecil yang cukup" dari `02-deployment-policy`. *(Draf awal sempat nyebut "monorepo" — nggak pernah kejadian secara struktural karena cuma 1 app, bukan beberapa package/workspace yang dikelola bareng. Dikoreksi 2026-08-05, lihat `PROGRESS.md`.)*
- **Standar yang diadopsi:** `00-engineering-standard` (golden rules fondasi) + `31-frontend-nextjs` (konvensi FE, sesuai stack Next.js).
- **Standar yang diambil prinsipnya saja (tidak literal):** `02-deployment-policy` — outcome thinking (D1 secret via env config, D7 observability via Sentry) tanpa infra K8s/GitOps penuh.
- **Di luar scope:** `40/41/42` (K8s-specific), `01-ecosystem-governance` (governance multi-project), `04-collaboration-sync` (multi-device/agent protocol), `20-scheduler`.

---

## 8. AI Dev-Process Integration

- Rencana membangun workflow subagent sendiri untuk proses development, terinspirasi dari pola role→doc di `03-role-manifest.md` (mis. subagent "FE Builder" hanya di-context-in `00`+`31`, subagent "Product Thinker" fokus ke user flow, subagent "Reviewer" ngecek compliance golden rules).
- BDD.ai sendiri sudah punya sistem subagent internal (dibuat oleh supervisor), tapi ini kesempatan untuk explore & membangun versi sendiri dengan tools/pendekatan pribadi — kemungkinan menemukan pendekatan yang berbeda/lebih baik.

---

## 9. Catatan untuk Bagian "Assumptions & Scope" di Write-up

Untuk ditulis eksplisit di bagian Product Thinking assessment — sebagai keputusan sadar, bukan keterbatasan:
- AI insight = simulasi/template tersimpan di DB, bukan live API call.
- Data ads = mock data, bukan API real ke platform.
- Billing/payment UI = tidak dibangun fungsional (tidak ada API/gateway asli), hanya *terasa* seperti alur payment gateway lewat animasi 3-tahap (konfirmasi → processing → sukses) untuk simulasi renewal — tetap murni UI, sesuai prinsip "mock data/simulasi" di atas.
- Multi-user/team permission per bisnis = di luar scope, dicatat sebagai roadmap.
- **Ticket/Support System (fitur #8) = resmi dicoret dari scope prototype.** Alasan: fokus effort ke core loop (connect → dashboard → AI insight) dan monetization (Billing), support portal dianggap fitur operasional yang nilainya lebih rendah buat demo assessment dibanding memperdalam AI layer. Dicatat sebagai roadmap next, bukan dibangun.
- **Mode Compare 2 Platform di Per-Platform Detail Dashboard (awalnya ada di fitur #4) = resmi dicoret dari scope.** Alasan: setelah dicoba, UX dua platform berdampingan (baik versi tabel maupun versi bar-chart per-metrik) dianggap menambah kompleksitas halaman tanpa value yang cukup dibanding drill-down per-platform biasa + chart tren performa yang lebih actionable untuk audiens business owner (bukan analyst). Kalau dibutuhkan lagi, functional building block-nya (union metrik, highlight pemenang) masih terdokumentasi di histori — tinggal rebuild kalau scope berubah.
- **Nav sidebar "Lainnya" = Billing, Settings, Connect Platform** (bukan "Pricing" seperti draf awal) — Settings ditambah sebagai nav item penuh (bukan cuma icon gear di footer) karena kontennya (Team & Akses, Notifikasi, Keamanan) cukup substantial untuk halaman sendiri.
- **Top bar (strip ramping di atas)** kini cuma berisi icon notifikasi (Activity Feed, sekarang dropdown asli yang anchor di bawah icon-nya, bukan panel sidebar sticky) — tombol Export & Connect Platform yang tadinya di situ dihapus karena sudah tersedia di tempat yang lebih kontekstual (Export ada di header tiap halaman terkait; Connect Platform tetap ada sebagai nav item sidebar & halaman sendiri).
