# Fitur: Per-Platform Detail Dashboard

> **Update scope:** mode "Compare 2 Platform" yang awalnya ada di dokumen ini sudah **dicoret dari scope** (lihat `business-plan.md` §9) setelah dicoba di mockup — dianggap menambah kompleksitas UI tanpa value sepadan buat audiens business owner. Sebagai gantinya halaman ini fokus ke drill-down single-platform yang lebih dalam, termasuk chart tren performa.

## Tujuan
Drill-down ke platform spesifik dengan kemampuan **switch antar platform**, lihat metrik lengkap + tren performanya dari waktu ke waktu.

## Step-by-step
1. Diakses dari klik nama platform di tabel campaign Overview, dari nav sidebar, atau dari AI Insight card.
2. **Platform switcher** — chip row di atas (Meta Ads / TikTok Ads / Google Analytics / Marketplace Ads — GA & Marketplace Ads masih katalog masa depan, di mockup saat ini baru Meta & TikTok yang aktif), klik chip lain langsung ganti seluruh konten halaman ke platform itu (KPI + chart + tabel campaign), tanpa reload.
3. **KPI grid per platform (8 metrik, gaya sama seperti Overview)** — tiap metrik ada persentase perubahan vs periode lalu (panah + warna, konsisten sama konvensi KPI Overview). Metrik disesuaikan tipenya, bukan dipaksa seragam:
   - Platform ads (Meta, TikTok, Marketplace): Spend, Closing, ROAS, CPA, CTR, Impresi, Klik, Campaign Aktif.
   - Platform analytics (Google Analytics): Sesi, Pengguna Baru, Konversi, Bounce Rate, Rata-rata Durasi, Pageviews — metrik ads (spend/ROAS/CPA) TIDAK dipaksakan karena GA bukan platform iklan. *(Belum diimplementasikan di mockup HTML — baru berlaku begitu GA masuk katalog.)*
4. **Chart "Tren Performa"** — line chart 7 hari untuk platform yang lagi dilihat, dengan toggle metrik Spend/Closing (chip, mirip pola toggle chart Overview).
5. Tabel campaign di platform tsb — kalau platform-nya analytics (ngga punya campaign, misal GA), tampilkan pesan penjelasan ("platform ini dipakai untuk tracking, bukan iklan") bukan tabel kosong tanpa konteks.
6. Tombol "Copy as report" di header buat export snapshot (lihat `06-insight-card-export.md`).

## Loading & Error State
- Sama pola dengan Overview: skeleton loading saat switch platform, error + retry.

## Checklist Selesai
- [ ] Platform switcher berfungsi, ganti KPI + chart + tabel sesuai platform terpilih
- [ ] KPI grid 8 metrik dengan indikator persentase perubahan (bukan cuma angka statis)
- [ ] Chart Tren Performa dengan toggle metrik berfungsi
- [ ] Metrik disesuaikan per tipe platform (ads vs analytics) begitu GA masuk katalog — bukan satu set metrik dipaksa ke semua
- [ ] Pesan penjelasan untuk platform tanpa data campaign (mis. GA)
- [ ] Export Insight Card tersedia di halaman ini
