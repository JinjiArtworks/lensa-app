# Fitur: Ticket / Support System

> **STATUS: DIHAPUS DARI SCOPE.** Fitur ini resmi dicoret dari prototype — lihat `business-plan.md` §9 untuk alasannya (fokus effort ke core loop + AI layer + monetization dibanding support portal). Nav item "Support", halaman, dan seluruh referensinya sudah dihapus dari mockup. Dokumen ini dibiarkan ada sebagai catatan histori/rasional keputusan, bukan spek yang masih perlu dibangun.

> Reframe dari fitur "Data Sync Requests" di produk asli BDD.ai — di sini jadi support portal buat end-user (business owner), bukan tool internal ops.

## Tujuan
User bisa submit request/masalah (data ngga sync, mau tambah platform baru, dst) dan lihat progress-nya.

## Step-by-step
1. Halaman "Support" / "Bantuan" di nav.
2. Tombol "Buat Ticket Baru" → form: kategori (dropdown: "Data tidak sync" / "Masalah koneksi platform" / "Lainnya"), deskripsi (textarea), opsional lampiran screenshot.
3. Setelah submit → ticket masuk list dengan status awal "Menunggu" (mock, tidak ada admin real yang respond untuk prototype — bisa disimulasikan status berubah otomatis setelah beberapa saat untuk demo, atau cukup static).
4. List ticket: tabel/card — kategori, tanggal dibuat, status (Menunggu/Diproses/Selesai), klik → detail drawer (deskripsi lengkap + timeline status).
5. (Opsional, kalau ada waktu) 1 halaman admin sederhana buat lihat semua ticket masuk — TIDAK perlu dashboard admin penuh, cukup list + update status manual.

## Loading & Error State
- Loading saat submit ticket (disabled button + spinner).
- Empty state: "Belum ada ticket" kalau list kosong.

## Checklist Selesai
- [ ] Form submit ticket dengan kategori & deskripsi
- [ ] List + detail view ticket dengan status
- [ ] Empty state ada
- [ ] Admin view (kalau dibangun) tetap minimal — bukan dashboard agency penuh
