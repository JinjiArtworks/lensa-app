# Fitur: Overview / Summary Dashboard

> Halaman paling sering dibuka user. Poles paling detail bareng Connect Platform.

## Tujuan
Blend data dari semua platform yang terkoneksi jadi 1 tampilan. Angka yang ditampilkan harus langsung nyambung ke bisnis, bukan istilah marketing teknis.

## KPI Utama (wajib ada)
- Total spend, total closing/konversi, ROAS gabungan (blended), CPA — 4 KPI utama.
- Baris KPI kedua: CTR, impresi, klik, jumlah campaign aktif.
- Trend chart (garis/area) — spend & konversi dari waktu ke waktu, filter by date range (7 hari / 30 hari).
- Channel performance chart (bar horizontal) — bandingin spend/closing per platform.

## Step-by-step
1. Header halaman: nama bisnis aktif (dari Business Switcher) + **Last Synced indicator** ("Data terakhir diperbarui: [timestamp] · [X] menit lalu") + tombol **Sync** (klik → loading state singkat → update timestamp jadi "baru saja" + toast konfirmasi).
2. **Info cakupan platform** — banner kecil yang ngasih tau eksplisit berapa dari total platform yang terhubung sudah tercakup di metrik ini ("Metrik ini mencakup X dari Y platform yang terhubung"). Kalau belum semua platform connect, sebutin platform mana yang belum, biar user aware angka yang mereka lihat belum lengkap.
3. Date range picker (7 hari / 30 hari) — semua angka & chart re-fetch sesuai range.
4. 8 KPI card (2 baris) — tiap card ada indikator naik/turun dibanding periode sebelumnya.
5. **Proactive Alert Card** — tampil kalau ada anomali dari data mock (contoh kondisi trigger: spend naik >X% tapi konversi stagnan/turun). Beda visual (border aksen) dari card biasa, CTA "Lihat detail" yang ngarahin ke AI Insight Panel.
6. Channel performance chart + trend chart berdampingan (2 kolom).
7. Toolbar tabel: search (live filter) + Save View + Filters.
8. Tabel semua campaign — search, pagination, klik row buka modal detail, klik nama platform lompat ke Detail Platform.
9. Tombol **"Copy as report"** di header buat export insight card (lihat `06-insight-card-export.md`).

## Loading & Error State
- Skeleton/spinner di tombol Sync saat proses refresh.
- Error state: kalau fetch gagal, tampilkan pesan + tombol retry, jangan biarin card kosong tanpa penjelasan.

## Checklist Selesai
- [ ] 8 KPI (2 baris) tampil dengan perbandingan periode sebelumnya
- [ ] Tombol Sync berfungsi dengan loading state dan update timestamp
- [ ] Info cakupan platform akurat (dinamis sesuai jumlah platform yang benar-benar connect)
- [ ] Last Synced indicator ada dan akurat
- [ ] Proactive Alert Card muncul kondisional (ada logic trigger, bukan selalu tampil)
- [ ] Channel performance chart + trend chart, konsisten style
- [ ] Search + pagination tabel campaign berfungsi
- [ ] Loading & error state lengkap
