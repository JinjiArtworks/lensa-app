# Fitur: Insight Card / Export ("Copy as Report")

## Tujuan
User bisa export snapshot performa (chart + insight) sebagai gambar buat di-share (misal ke partner bisnis/tim internal mereka).

## Step-by-step
1. Tombol "Copy as Report" / ikon share di Overview & Platform Detail Dashboard.
2. Klik → generate kartu visual: chart/metric yang lagi dilihat + 1 baris kesimpulan AI Insight terkait + branding kecil "via Lensa" di pojok.
3. Pakai `html2canvas` (sama lib yang dipakai produk asli BDD.ai) untuk render section terpilih jadi image.
4. Setelah generate: preview modal muncul dengan 2 opsi — "Copy to Clipboard" (pakai Clipboard API) dan "Download Image".
5. Toast konfirmasi setelah copy/download sukses.

## Loading & Error State
- Loading state saat generate image (bisa makan waktu sedikit kalau chart kompleks).
- Error: kalau Clipboard API gagal (browser permission), fallback ke Download otomatis + pesan penjelasan.

## Checklist Selesai
- [ ] Kartu hasil export ada chart + insight text + branding, bukan screenshot mentah
- [ ] Copy to clipboard berfungsi (dengan fallback download)
- [ ] Preview sebelum copy/download
- [ ] Berfungsi dari 2 tempat: Overview & Platform Detail
