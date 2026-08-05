# Fitur: AI Insight Panel

> **Penting:** ini simulasi/template tersimpan di Firestore, BUKAN live call ke AI API. Dicatat eksplisit sebagai keputusan sadar di `business-plan.md` §9 — jangan diam-diam diganti jadi live API oleh agent manapun.

## Tujuan
Terjemahin data lintas-platform jadi insight bahasa bisnis (bukan jargon marketing), buat user yang belum tentu paham istilah teknis ads.

## Step-by-step
1. Buat set kondisi/skenario template di Firestore (`insight_templates` collection), dikelompokkan per kategori: **Anomali**, **Rekomendasi**, **Positif** — minimal 4-5 skenario per kategori realistis, contoh:
   - Spend naik + konversi turun di satu platform → saran audit creative/targeting.
   - ROAS satu platform jauh lebih baik dari platform lain → saran realokasi budget.
   - Spend naik merata tapi CPA membaik → insight positif (positive reinforcement, bukan cuma alert masalah).
   - Data platform tertentu stagnan >X hari → saran cek campaign aktif/nonaktif.
2. Function/logic sederhana yang cocokin kondisi data mock (deterministik, bukan AI generation real) ke template yang sesuai, isi placeholder angka dengan data mock aktual.
3. **Layout modern (card grid 2 kolom):** tiap insight jadi card dengan icon badge berwarna sesuai kategori, tag kategori + tag platform + tag **Impact** (Tinggi/Sedang/Rendah), judul bold, deskripsi 1-2 kalimat, **baris estimasi dampak kuantitatif** (mis. "Potensi +8-10 closing tambahan/bulan bila 15% budget dialihkan ke Meta Ads"), timestamp, action link (mis. "Tandai diterapkan" untuk rekomendasi, "Lihat platform →" untuk anomali/positif yang terkait platform tertentu), dan tombol feedback icon-only 👍/👎 ("Membantu"/"Tidak membantu") di footer card.
4. **Panel "Rekomendasi Prioritas"** — di atas grid, sebelum data pendukung (Benchmark/Budget Rec): ringkasan 2-3 insight ber-impact Tinggi (fallback ke Sedang kalau Tinggi kurang dari 2) yang sebaiknya dikerjakan duluan, masing-masing dengan alasan singkat + action link. Tujuannya biar user langsung tahu "abis liat ini, gue harus ngapain" tanpa scroll baca semua card satu-satu.
5. **Ringkasan stat** di atas grid: total insight, jumlah yang perlu aksi segera, jumlah rekomendasi baru — angka ini ikut berubah sesuai periode yang dipilih (lihat poin 7).
6. **Filter kategori** (Semua/Anomali/Rekomendasi/Positif) **+ filter platform** (Semua Platform/Meta Ads/TikTok Ads, pakai `<select>` biar ringkas) — digabung jadi satu baris toolbar bareng filter periode, client-side filter kombinasi (AND), ngga perlu refetch.
7. **Filter periode** (Kemarin / 1 Bulan Lalu / 3 Bulan Lalu) — tiap periode punya set insight & angka statistik berbeda (bukan cuma UI kosong yang ganti label). Di atas grid, tampilkan **baris perbandingan** singkat ("Dibanding periode sebelumnya: ...") biar insight terasa punya konteks temporal, bukan snapshot statis.
8. **Tombol Sync & Analisis Ulang** — trigger simulasi AI menganalisis ulang data terkini (loading state ~1-2 detik), lalu update timestamp "AI selesai menganalisis" + toast konfirmasi. Tetap simulasi/template, bukan live API call.
9. Panel ini yang jadi sumber Proactive Alert Card di Overview — insight kategori "Anomali" paling relevan yang dipakai.

## Loading & Error State
- Loading singkat saat filter periode berubah atau saat Sync & Analisis Ulang ditekan.
- Kalau gagal fetch template dari Firestore: fallback ke pesan default, jangan error keras.

## Checklist Selesai
- [ ] Minimal 4-5 skenario template per kategori per periode (bukan cuma 1 generic filler text)
- [ ] Layout card grid modern (icon badge, tag, impact badge, action link, feedback) — bukan blok teks polos
- [ ] Panel "Rekomendasi Prioritas" tampil di atas grid, isinya insight impact tertinggi periode itu
- [ ] Filter kategori & filter platform & filter periode berfungsi dan mengubah konten secara nyata (kombinasi AND)
- [ ] Baris perbandingan antar-periode tampil dan masuk akal
- [ ] Tombol Sync & Analisis Ulang berfungsi dengan loading state
- [ ] Logic pencocokan kondisi → template terdokumentasi jelas di kode (komentar, bukan magic number). *(Catatan: di mockup HTML saat ini datanya masih array statis per-periode, belum ada logic pencocokan kondisi dinamis — ini prioritas yang perlu diimplementasikan begitu masuk build Next.js/Firebase asli.)*
- [ ] Insight ditulis bahasa bisnis, bukan jargon
- [ ] Dipakai juga di Proactive Alert Card (reuse logic, bukan duplikasi)
