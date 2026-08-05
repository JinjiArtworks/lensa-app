# Lensa — Feature Specs (00-08)

> **Konsolidasi 2026-08-05:** file ini gabungan dari 9 file spek fitur yang tadinya berdiri sendiri (`00-auth-flow.md` s/d `08-pricing-page.md`) — digabung karena tiap file aslinya cuma puluhan baris (redundant sebagai file terpisah). `09-data-layer-wiring.md` dan seterusnya (`10-`, `11-`) **tidak** ikut digabung — itu spek arsitektur data yang lebih tebal dan lebih baru, tetap file sendiri.
>
> **PENTING — cara baca file ini:** checklist di tiap section adalah **acceptance criteria original**, ditulis SEBELUM implementasi. Ini bukan status hidup/terkini. Untuk tau apa yang BENERAN sudah selesai (dan kapan, dan gimana), baca `PROGRESS.md` — itu satu-satunya sumber status yang di-update tiap sesi kerja. Beberapa detail teknis di bawah juga sudah nggak akurat dibanding implementasi asli (paling nyata: §05 soal template Firestore — dibiarkan apa adanya dengan catatan koreksi inline, bukan diedit diam-diam, karena ini adalah spek asli yang jadi acuan waktu build).

---

## 00 — Auth Flow (Sign Up / Sign In)

> **Catatan:** fitur ini belum eksplisit dibahas di diskusi sebelumnya — ditambahkan karena semua fitur lain butuh user login dulu. Prasyarat teknis, bukan fitur yang dinilai UX-nya secara mendalam, tapi tetap harus ada & fungsional.

### Tujuan
User bisa daftar & login sebelum akses dashboard. Pakai Firebase Auth.

### Step-by-step
1. **Sign Up** — form: nama, email, password (+ konfirmasi password). Validasi via Zod (email valid, password min 8 char).
2. Setelah sign up sukses → buat 1 dokumen `user` di Firestore + 1 dokumen `business` default (kosong, belum ada platform connect) → redirect ke Connect Platform (§01 di bawah).
3. **Sign In** — email + password via Firebase Auth SDK. Redirect ke Overview Dashboard bisnis terakhir yang aktif (atau ke Connect Platform kalau belum ada platform yang terkoneksi).
4. **Forgot Password** — trigger Firebase `sendPasswordResetEmail`.
5. Session disimpan sesuai golden rule BDD: token di memory (Zustand `auth` store), refresh via Firebase SDK — **jangan** simpan token di localStorage.

### Loading & Error State
- Form submit: tombol disabled + spinner saat `isPending`.
- Error: pesan spesifik dari Firebase Auth error code (email sudah dipakai, password salah, dst) — jangan tampilin raw error object.

### Checklist Selesai (acceptance criteria original)
- [ ] Sign up, sign in, forgot password berfungsi
- [ ] Validasi form via Zod
- [ ] Token tidak di localStorage
- [ ] Redirect logic sesuai (ada bisnis aktif vs belum ada platform)
- [ ] Loading & error state ada di semua form

---

## 01 — Connect Platform (Onboarding) + Empty State

> Ini titik UX paling krusial di produk — first impression. Poles lebih dari fitur lain.
> **Update:** layout final = **list vertikal** (bukan card grid) dengan icon checklist bulat yang muncul setelah connect sukses.

### Tujuan
User connect akun ads mereka supaya dashboard bisa nampilin data. Onboarding fokus ke 2 platform dulu (Meta Ads & TikTok Ads) biar cepat masuk ke dashboard — platform lain (Google Analytics, Marketplace Ads) ditambah belakangan lewat menu Connect Platform di dalam dashboard.

### Step-by-step
1. Setelah sign in pertama kali → tampilkan halaman onboarding: headline + list 2 row platform (Meta Ads, TikTok Ads), masing-masing baris ada icon platform + nama + subtext + status circle di kanan.
2. Klik salah satu row → simulasi connect: circle status berubah jadi spinner ~1 detik, lalu jadi **icon checklist hijau** + row berubah warna (border+background hijau muda) menandakan sudah terhubung.
3. Setelah minimal 1 platform connect → tombol "Lanjut ke dashboard" yang tadinya disabled jadi aktif.
4. Toast konfirmasi muncul tiap kali 1 platform berhasil connect.
5. Setelah masuk dashboard, user bisa nambah platform lain (Google Analytics, Marketplace Ads) kapan saja lewat menu **Connect Platform** di sidebar — total katalog Pro: 4 platform.

### Loading & Error State
- Loading saat simulasi connect (spinner menggantikan status circle di row yang diklik).
- Error state: kalau simulasi gagal (untuk testing), tampilkan pesan retry-able, jangan silent fail.

### Checklist Selesai (acceptance criteria original)
- [ ] Layout list vertikal (bukan card grid)
- [ ] Alur connect Meta & TikTok dengan loading state realistis + icon checklist saat sukses
- [ ] Tombol lanjut disabled sampai minimal 1 platform connect
- [ ] Toast/notifikasi sukses setelah connect
- [ ] Menu Connect Platform di dalam dashboard tetap bisa nambah Google Analytics & Marketplace Ads kapan saja

---

## 02 — Business Switcher (Multi-Business, Pro Tier)

### Tujuan
1 user account bisa punya lebih dari 1 bisnis (Pro tier — di prototype ini di-assume sudah aktif). User switch konteks dashboard antar bisnis via switcher di sidebar.

### Step-by-step
1. Dropdown card di **sidebar** (bagian atas, di bawah logo) — nampilin nama bisnis aktif + plan (Free/Pro) + ikon panah.
2. Klik dropdown → list semua bisnis milik user (nama + inisial kecil) + opsi "+ Tambah Bisnis Baru" di paling bawah.
3. Pilih bisnis lain → seluruh state dashboard (Overview, Detail, AI Insight) re-scope ke `business_id` yang baru dipilih. Gunakan query key TanStack Query yang include `business_id` supaya cache per-bisnis terpisah.
4. Klik "+ Tambah Bisnis Baru":
   - Kalau Free tier → tampilkan upgrade prompt ke Pro (ngarah ke Pricing Page).
   - Kalau Pro tier (default assumption di prototype ini) → langsung bisa tambah bisnis baru: form simpel nama bisnis → redirect ke Connect Platform (§01) untuk bisnis baru itu.
5. Bisnis aktif terakhir disimpan (Zustand `ui` store atau Firestore user preference) supaya persist di reload/reload session berikutnya.

### Loading & Error State
- Switch bisnis: skeleton loading singkat di dashboard saat data bisnis baru di-fetch.

### Checklist Selesai (acceptance criteria original)
- [ ] Dropdown switcher ada di sidebar (bukan top nav)
- [ ] Data ter-scope benar per `business_id` (test: switch, pastikan data ngga ketuker)
- [ ] Free tier diblokir bikin bisnis ke-2 dengan upgrade prompt; Pro tier bebas nambah
- [ ] Bisnis aktif persist antar sesi

---

## 03 — Overview / Summary Dashboard

> Halaman paling sering dibuka user. Poles paling detail bareng Connect Platform.

### Tujuan
Blend data dari semua platform yang terkoneksi jadi 1 tampilan. Angka yang ditampilkan harus langsung nyambung ke bisnis, bukan istilah marketing teknis.

### KPI Utama (wajib ada)
- Total spend, total closing/konversi, ROAS gabungan (blended), CPA — 4 KPI utama.
- Baris KPI kedua: CTR, impresi, klik, jumlah campaign aktif.
- Trend chart (garis/area) — spend & konversi dari waktu ke waktu, filter by date range (7 hari / 30 hari).
- Channel performance chart (bar horizontal) — bandingin spend/closing per platform.

### Step-by-step
1. Header halaman: nama bisnis aktif (dari Business Switcher) + **Last Synced indicator** ("Data terakhir diperbarui: [timestamp] · [X] menit lalu") + tombol **Sync** (klik → loading state singkat → update timestamp jadi "baru saja" + toast konfirmasi).
2. **Info cakupan platform** — banner kecil yang ngasih tau eksplisit berapa dari total platform yang terhubung sudah tercakup di metrik ini ("Metrik ini mencakup X dari Y platform yang terhubung"). Kalau belum semua platform connect, sebutin platform mana yang belum, biar user aware angka yang mereka lihat belum lengkap.
3. Date range picker (7 hari / 30 hari) — semua angka & chart re-fetch sesuai range.
4. 8 KPI card (2 baris) — tiap card ada indikator naik/turun dibanding periode sebelumnya.
5. **Proactive Alert Card** — tampil kalau ada anomali dari data mock (contoh kondisi trigger: spend naik >X% tapi konversi stagnan/turun). Beda visual (border aksen) dari card biasa, CTA "Lihat detail" yang ngarahin ke AI Insight Panel.
6. Channel performance chart + trend chart berdampingan (2 kolom).
7. Toolbar tabel: search (live filter) + Save View + Filters.
8. Tabel semua campaign — search, pagination, klik row buka modal detail, klik nama platform lompat ke Detail Platform.
9. Tombol **"Copy as report"** di header buat export insight card (§06).

### Loading & Error State
- Skeleton/spinner di tombol Sync saat proses refresh.
- Error state: kalau fetch gagal, tampilkan pesan + tombol retry, jangan biarin card kosong tanpa penjelasan.

### Checklist Selesai (acceptance criteria original)
- [ ] 8 KPI (2 baris) tampil dengan perbandingan periode sebelumnya
- [ ] Tombol Sync berfungsi dengan loading state dan update timestamp
- [ ] Info cakupan platform akurat (dinamis sesuai jumlah platform yang benar-benar connect)
- [ ] Last Synced indicator ada dan akurat
- [ ] Proactive Alert Card muncul kondisional (ada logic trigger, bukan selalu tampil)
- [ ] Channel performance chart + trend chart, konsisten style
- [ ] Search + pagination tabel campaign berfungsi
- [ ] Loading & error state lengkap

---

## 04 — Per-Platform Detail Dashboard

> **Update scope:** mode "Compare 2 Platform" yang awalnya ada di dokumen ini sudah **dicoret dari scope** (lihat `business-plan.md` §9) setelah dicoba di mockup — dianggap menambah kompleksitas UI tanpa value sepadan buat audiens business owner. Sebagai gantinya halaman ini fokus ke drill-down single-platform yang lebih dalam, termasuk chart tren performa.

### Tujuan
Drill-down ke platform spesifik dengan kemampuan **switch antar platform**, lihat metrik lengkap + tren performanya dari waktu ke waktu.

### Step-by-step
1. Diakses dari klik nama platform di tabel campaign Overview, dari nav sidebar, atau dari AI Insight card.
2. **Platform switcher** — chip row di atas (Meta Ads / TikTok Ads / Google Analytics / Marketplace Ads — GA & Marketplace Ads masih katalog masa depan, saat ini baru Meta & TikTok yang aktif), klik chip lain langsung ganti seluruh konten halaman ke platform itu (KPI + chart + tabel campaign), tanpa reload.
3. **KPI grid per platform (8 metrik, gaya sama seperti Overview)** — tiap metrik ada persentase perubahan vs periode lalu (panah + warna, konsisten sama konvensi KPI Overview). Metrik disesuaikan tipenya, bukan dipaksa seragam:
   - Platform ads (Meta, TikTok, Marketplace): Spend, Closing, ROAS, CPA, CTR, Impresi, Klik, Campaign Aktif.
   - Platform analytics (Google Analytics): Sesi, Pengguna Baru, Konversi, Bounce Rate, Rata-rata Durasi, Pageviews — metrik ads (spend/ROAS/CPA) TIDAK dipaksakan karena GA bukan platform iklan. *(Belum diimplementasikan — baru berlaku begitu GA masuk katalog.)*
4. **Chart "Tren Performa"** — line chart 7 hari untuk platform yang lagi dilihat, dengan toggle metrik Spend/Closing (chip, mirip pola toggle chart Overview).
5. Tabel campaign di platform tsb — kalau platform-nya analytics (ngga punya campaign, misal GA), tampilkan pesan penjelasan ("platform ini dipakai untuk tracking, bukan iklan") bukan tabel kosong tanpa konteks.
6. Tombol "Copy as report" di header buat export snapshot (§06).

### Loading & Error State
- Sama pola dengan Overview: skeleton loading saat switch platform, error + retry.

### Checklist Selesai (acceptance criteria original)
- [ ] Platform switcher berfungsi, ganti KPI + chart + tabel sesuai platform terpilih
- [ ] KPI grid 8 metrik dengan indikator persentase perubahan (bukan cuma angka statis)
- [ ] Chart Tren Performa dengan toggle metrik berfungsi
- [ ] Metrik disesuaikan per tipe platform (ads vs analytics) begitu GA masuk katalog — bukan satu set metrik dipaksa ke semua
- [ ] Pesan penjelasan untuk platform tanpa data campaign (mis. GA)
- [ ] Export Insight Card tersedia di halaman ini

---

## 05 — AI Insight Panel

> **Penting:** ini simulasi/template, BUKAN live call ke AI API. Dicatat eksplisit sebagai keputusan sadar di `business-plan.md` §9 — jangan diam-diam diganti jadi live API oleh agent manapun.
>
> **Koreksi 2026-08-05 (implementasi menyimpang dari spek di bawah):** poin 1 di bawah nyebut template disimpan di **Firestore** (`insight_templates` collection). Implementasi asli **bukan begitu** — template bank-nya static array di kode (`features/insight/mock-data.ts` + `insight-matcher.ts`), bukan Firestore. Lihat `10-data-flow-reference.md` buat arsitektur data yang beneran jalan. Sisa spek di bawah (layout, filter, panel prioritas) tetap akurat.

### Tujuan
Terjemahin data lintas-platform jadi insight bahasa bisnis (bukan jargon marketing), buat user yang belum tentu paham istilah teknis ads.

### Step-by-step
1. ~~Buat set kondisi/skenario template di Firestore (`insight_templates` collection)~~ — lihat catatan koreksi di atas. Dikelompokkan per kategori: **Anomali**, **Rekomendasi**, **Positif** — minimal 4-5 skenario per kategori realistis, contoh:
   - Spend naik + konversi turun di satu platform → saran audit creative/targeting.
   - ROAS satu platform jauh lebih baik dari platform lain → saran realokasi budget.
   - Spend naik merata tapi CPA membaik → insight positif (positive reinforcement, bukan cuma alert masalah).
   - Data platform tertentu stagnan >X hari → saran cek campaign aktif/nonaktif.
2. Function/logic sederhana yang cocokin kondisi data mock (deterministik, bukan AI generation real) ke template yang sesuai, isi placeholder angka dengan data mock aktual.
3. **Layout modern (card grid 2 kolom):** tiap insight jadi card dengan icon badge berwarna sesuai kategori, tag kategori + tag platform + tag **Impact** (Tinggi/Sedang/Rendah), judul bold, deskripsi 1-2 kalimat, **baris estimasi dampak kuantitatif** (mis. "Potensi +8-10 closing tambahan/bulan bila 15% budget dialihkan ke Meta Ads"), timestamp, action link (mis. "Tandai diterapkan" untuk rekomendasi, "Lihat platform →" untuk anomali/positif yang terkait platform tertentu), dan tombol feedback icon-only 👍/👎 ("Membantu"/"Tidak membantu") di footer card.
4. **Panel "Rekomendasi Prioritas"** — di atas grid, sebelum data pendukung (Benchmark/Budget Rec): ringkasan 2-3 insight ber-impact Tinggi (fallback ke Sedang kalau Tinggi kurang dari 2) yang sebaiknya dikerjakan duluan, masing-masing dengan alasan singkat + action link.
5. **Ringkasan stat** di atas grid: total insight, jumlah yang perlu aksi segera, jumlah rekomendasi baru — angka ini ikut berubah sesuai periode yang dipilih.
6. **Filter kategori** (Semua/Anomali/Rekomendasi/Positif) **+ filter platform** (Semua Platform/Meta Ads/TikTok Ads) — digabung jadi satu baris toolbar bareng filter periode, client-side filter kombinasi (AND).
7. **Filter periode** (Kemarin / 1 Bulan Lalu / 3 Bulan Lalu) — tiap periode punya set insight & angka statistik berbeda. Di atas grid, tampilkan **baris perbandingan** singkat ("Dibanding periode sebelumnya: ...").
8. **Tombol Sync & Analisis Ulang** — trigger simulasi AI menganalisis ulang data terkini (loading state ~1-2 detik), lalu update timestamp + toast konfirmasi. Tetap simulasi/template, bukan live API call.
9. Panel ini yang jadi sumber Proactive Alert Card di Overview — insight kategori "Anomali" paling relevan yang dipakai.

### Loading & Error State
- Loading singkat saat filter periode berubah atau saat Sync & Analisis Ulang ditekan.
- Kalau gagal fetch template: fallback ke pesan default, jangan error keras.

### Checklist Selesai (acceptance criteria original)
- [ ] Minimal 4-5 skenario template per kategori per periode
- [ ] Layout card grid modern (icon badge, tag, impact badge, action link, feedback)
- [ ] Panel "Rekomendasi Prioritas" tampil di atas grid
- [ ] Filter kategori & filter platform & filter periode berfungsi (kombinasi AND)
- [ ] Baris perbandingan antar-periode tampil dan masuk akal
- [ ] Tombol Sync & Analisis Ulang berfungsi dengan loading state
- [ ] Logic pencocokan kondisi → template terdokumentasi jelas di kode
- [ ] Insight ditulis bahasa bisnis, bukan jargon
- [ ] Dipakai juga di Proactive Alert Card (reuse logic, bukan duplikasi)

---

## 06 — Insight Card / Export ("Copy as Report")

### Tujuan
User bisa export snapshot performa (chart + insight) sebagai gambar buat di-share (misal ke partner bisnis/tim internal mereka).

### Step-by-step
1. Tombol "Copy as Report" / ikon share di Overview & Platform Detail Dashboard.
2. Klik → generate kartu visual: chart/metric yang lagi dilihat + 1 baris kesimpulan AI Insight terkait + branding kecil "via Lensa" di pojok.
3. Pakai `html2canvas` untuk render section terpilih jadi image.
4. Setelah generate: preview modal muncul dengan 2 opsi — "Copy to Clipboard" (pakai Clipboard API) dan "Download Image".
5. Toast konfirmasi setelah copy/download sukses.

### Loading & Error State
- Loading state saat generate image.
- Error: kalau Clipboard API gagal (browser permission), fallback ke Download otomatis + pesan penjelasan.

### Checklist Selesai (acceptance criteria original)
- [ ] Kartu hasil export ada chart + insight text + branding, bukan screenshot mentah
- [ ] Copy to clipboard berfungsi (dengan fallback download)
- [ ] Preview sebelum copy/download
- [ ] Berfungsi dari 2 tempat: Overview & Platform Detail

---

## 07 — Ticket / Support System

> **STATUS: DIHAPUS DARI SCOPE.** Fitur ini resmi dicoret dari prototype — lihat `business-plan.md` §9 untuk alasannya (fokus effort ke core loop + AI layer + monetization dibanding support portal). Nav item "Support", halaman, dan seluruh referensinya sudah dihapus. Section ini dibiarkan ada sebagai catatan histori/rasional keputusan, bukan spek yang masih perlu dibangun.

### Tujuan (tidak dibangun)
User bisa submit request/masalah (data ngga sync, mau tambah platform baru, dst) dan lihat progress-nya.

### Step-by-step (rencana awal, tidak dieksekusi)
1. Halaman "Support" / "Bantuan" di nav.
2. Tombol "Buat Ticket Baru" → form: kategori, deskripsi, opsional lampiran screenshot.
3. Setelah submit → ticket masuk list dengan status awal "Menunggu".
4. List ticket: tabel/card — kategori, tanggal dibuat, status, klik → detail drawer.
5. (Opsional) 1 halaman admin sederhana buat lihat semua ticket masuk.

### Checklist Selesai
Tidak berlaku — fitur dicoret dari scope sebelum dibangun.

---

## 08 — Billing & Paket Page

> **Update:** halaman ini digabung ke dalam **Billing** (bukan nav item "Pricing" terpisah) sebagai sub-tab "Paket Tersedia", di samping sub-tab "Ringkasan" (plan aktif, metode pembayaran, riwayat invoice). Mockup only — tidak ada payment gateway fungsional beneran.

### Tujuan
User bisa lihat perbandingan plan (Free vs Pro), status plan aktif, dan simulasi alur pembayaran — semuanya tanpa payment gateway real.

### Step-by-step (kondisi saat build)
1. Diakses lewat nav sidebar **Billing** → sub-tab **"Ringkasan"** (default) atau **"Paket Tersedia"** (pola tab sama seperti Settings).
2. Sub-tab **Paket Tersedia**: 2 card perbandingan **Free** vs **Pro**, murni informational:
   - Free: 1 bisnis, **1 platform**, 1 pengguna, AI Insight dasar (kategori Positif saja), histori 7 hari, tanpa export & multi-bisnis.
   - Pro (aktif): multi-bisnis, unlimited platform (katalog max 4), full AI Insight, export, histori penuh.
3. Sub-tab **Ringkasan**: card plan Pro aktif + tombol **"Perpanjang Sekarang"** → modal simulasi payment gateway 3-tahap: (a) konfirmasi ringkasan pembayaran, (b) animasi "menghubungkan ke payment gateway…" (~1.8 detik), (c) sukses — update tanggal perpanjangan + tambah baris baru di Riwayat Invoice. Ini flow **renewal langganan Pro yang sudah aktif**, bukan flow upgrade Free→Pro.
4. **Belum dibangun:** alur upgrade Free→Pro yang dipicu dari limit-gate (mis. di Business Switcher pas user Free coba nambah bisnis ke-2). Kalau fitur ini mau di-build, ikutin pola yang sama (tombol "Upgrade ke Pro" → modal konfirmasi simpel → toast sukses → redirect balik ke halaman asal).
5. Footer disclaimer "mock/simulasi" **belum ditambahkan**.

### Loading & Error State
- Loading state jelas ada di tahap "processing" modal Perpanjang Sekarang.
- Tidak perlu error state kompleks karena ini mock.

### Checklist Selesai (acceptance criteria original)
- [x] Perbandingan Free vs Pro jelas dan visual — sub-tab Paket Tersedia
- [x] Alur simulasi pembayaran (renewal) berfungsi dengan animasi gateway-style, tanpa payment real
- [ ] Alur upgrade Free→Pro dari limit-gate — belum dibangun
- [ ] Bisa diakses dari upgrade prompt manapun di app — belum, baru dari Billing
- [ ] Footer "mock/simulasi" disclaimer — belum ditambahkan
