# Fitur: Billing & Paket Page

> **Update:** halaman ini digabung ke dalam **Billing** (bukan nav item "Pricing" terpisah) sebagai sub-tab "Paket Tersedia", di samping sub-tab "Ringkasan" (plan aktif, metode pembayaran, riwayat invoice). Mockup only — tidak ada payment gateway fungsional beneran (tidak ada API/gateway asli dipanggil), walau simulasi renewal-nya sekarang lebih detil animasinya dari draf awal.

## Tujuan
User bisa lihat perbandingan plan (Free vs Pro), status plan aktif, dan simulasi alur pembayaran — semuanya tanpa payment gateway real.

## Step-by-step (kondisi saat ini di mockup)
1. Diakses lewat nav sidebar **Billing** → sub-tab **"Ringkasan"** (default) atau **"Paket Tersedia"** (pola tab sama seperti Settings).
2. Sub-tab **Paket Tersedia**: 2 card perbandingan **Free** vs **Pro**, murni informational (checkmark/x-mark list, tanpa tombol switch plan):
   - Free: 1 bisnis, **1 platform** (pilih salah satu Meta Ads/TikTok Ads), 1 pengguna, AI Insight dasar (kategori Positif saja), histori 7 hari, tanpa export & multi-bisnis.
   - Pro (aktif): multi-bisnis, unlimited platform (katalog max 4), full AI Insight, export, histori penuh.
3. Sub-tab **Ringkasan**: card plan Pro aktif + tombol **"Perpanjang Sekarang"** → modal simulasi payment gateway 3-tahap: (a) konfirmasi ringkasan pembayaran, (b) animasi "menghubungkan ke payment gateway…" (~1.8 detik), (c) sukses — update tanggal perpanjangan + tambah baris baru di Riwayat Invoice. Ini flow **renewal langganan Pro yang sudah aktif**, bukan flow upgrade Free→Pro.
4. **Belum dibangun di mockup ini:** alur upgrade Free→Pro yang dipicu dari limit-gate (mis. di Business Switcher pas user Free coba nambah bisnis ke-2, atau di Connect Platform pas coba connect platform ke-2). Kalau fitur ini mau di-build, ikutin pola yang sama (tombol "Upgrade ke Pro" → modal konfirmasi simpel → toast sukses → redirect balik ke halaman asal), dipicu dari titik manapun yang relevan, bukan cuma dari Billing.
5. Footer disclaimer "mock/simulasi" **belum ditambahkan** — masih perlu, terutama di sub-tab Paket Tersedia.

## Loading & Error State
- Loading state jelas ada di tahap "processing" modal Perpanjang Sekarang.
- Tidak perlu error state kompleks karena ini mock — cukup happy path yang smooth.

## Checklist Selesai
- [x] Perbandingan Free vs Pro jelas dan visual (bukan cuma teks) — sub-tab Paket Tersedia
- [x] Alur simulasi pembayaran (renewal) berfungsi dengan animasi gateway-style, tanpa payment real
- [ ] Alur upgrade Free→Pro dari limit-gate — belum dibangun, lihat poin 4
- [ ] Bisa diakses dari upgrade prompt manapun di app (Business Switcher, Connect Platform) — belum, baru dari Billing
- [ ] Footer "mock/simulasi" disclaimer — belum ditambahkan
