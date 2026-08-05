# Fitur: Connect Platform (Onboarding) + Empty State

> Ini titik UX paling krusial di produk — first impression. Poles lebih dari fitur lain.
> **Update:** layout final = **list vertikal** (bukan card grid) dengan icon checklist bulat yang muncul setelah connect sukses.

## Tujuan
User connect akun ads mereka supaya dashboard bisa nampilin data. Onboarding fokus ke 2 platform dulu (Meta Ads & TikTok Ads) biar cepat masuk ke dashboard — platform lain (Google Analytics, Marketplace Ads) ditambah belakangan lewat menu Connect Platform di dalam dashboard.

## Step-by-step
1. Setelah sign in pertama kali → tampilkan halaman onboarding: headline + list 2 row platform (Meta Ads, TikTok Ads), masing-masing baris ada icon platform + nama + subtext + status circle di kanan.
2. Klik salah satu row → simulasi connect: circle status berubah jadi spinner ~1 detik, lalu jadi **icon checklist hijau** + row berubah warna (border+background hijau muda) menandakan sudah terhubung.
3. Setelah minimal 1 platform connect → tombol "Lanjut ke dashboard" yang tadinya disabled jadi aktif.
4. Toast konfirmasi muncul tiap kali 1 platform berhasil connect.
5. Setelah masuk dashboard, user bisa nambah platform lain (Google Analytics, Marketplace Ads) kapan saja lewat menu **Connect Platform** di sidebar — total katalog Pro: 4 platform.

## Loading & Error State
- Loading saat simulasi connect (spinner menggantikan status circle di row yang diklik).
- Error state: kalau simulasi gagal (untuk testing), tampilkan pesan retry-able, jangan silent fail.

## Checklist Selesai
- [ ] Layout list vertikal (bukan card grid)
- [ ] Alur connect Meta & TikTok dengan loading state realistis + icon checklist saat sukses
- [ ] Tombol lanjut disabled sampai minimal 1 platform connect
- [ ] Toast/notifikasi sukses setelah connect
- [ ] Menu Connect Platform di dalam dashboard tetap bisa nambah Google Analytics & Marketplace Ads kapan saja

