# Lensa — Design System Reference

> **Update terakhir:** direvisi dari draf awal (nav top-center + monochrome + accent ungu) ke arah final di bawah, setelah beberapa iterasi eksplorasi visual & build mockup interaktif.

## Layout Prinsip
- **Nav: sidebar kiri**, bukan top-center. Sidebar berisi: logo → **business switcher** → menu utama (Overview, Detail Platform, AI Insight) → menu lain (Billing, Settings, Connect Platform) → footer (avatar + role + settings icon).
- Top bar cuma strip ramping berisi 1 aksi global: icon notifikasi (Activity Feed) — sekarang berupa **dropdown asli** (`position:absolute`, anchor tepat di bawah icon bell, auto-close saat klik di luar), bukan panel sidebar sticky yang nempel di ujung kanan konten. Export & Connect Platform yang tadinya nangkring di sini sudah dipindah ke tempat lebih kontekstual (Export ada di header tiap halaman terkait; Connect Platform sudah jadi nav item + halaman sendiri).
- Struktur halaman: sidebar tetap (sticky) + main content area max-width, card-based layout untuk KPI & insight (rounded-2xl, shadow tipis).
- Di layar sempit (<760px), sidebar menyusut jadi icon-only (label disembunyikan).

## Komponen
- Card, dropdown-menu, modal, table, chip/tab, badge, toast — komponen custom ringan (bisa di-swap ke shadcn/ui kalau eksekusi asli pakai React).
- Chart: **Chart.js** (line, bar, doughnut) di mockup — kalau eksekusi Next.js, boleh tetap Chart.js atau migrasi ke Recharts, style tetap ikut token warna di bawah.

## Warna & Tipografi
- **Base:** neutral terang (`--bg #f7f7f9`, `--card #fff`, `--line #e8e8ee`), teks `--ink #16161a` / `--ink2 #6b6b76` / `--ink3 #9d9da6`.
- **Accent utama: amber/gold** (`--accent #f0b400`, `--accent-bg #fff6d6`, `--accent-text #8a6400`) — dipakai untuk semua state aktif (nav aktif, chip aktif, tombol primer, tab aktif, pagination aktif). *(Revisi dari draf sebelumnya yang sempat menetapkan ungu `#6d5ef0` — amber dipilih & dipakai konsisten sepanjang build mockup, jadi ini yang final sekarang.)* **Hindari kombinasi hitam solid untuk elemen aktif/interaktif** — prinsip ini tetap berlaku terlepas dari hue accent-nya.
- **Warna semantik status:** hijau (`--green #0f9d5f`) = positif/aktif/selesai, amber (`--amber #c07d09`, beda shade dari accent) = perlu ditinjau/pending, merah (`--red #d23b3b`) = anomali/urgent/archived, abu (`--gray #8b8f99`) = netral/paused.
- Font: **Inter** (400/500/600/700/800), konsisten di semua halaman.

## Struktur Sidebar
```
Logo "Lensa"
Business Switcher (dropdown card, nama bisnis + plan)
── Menu ──
Overview · Detail Platform · AI Insight
── Lainnya ──
Billing · Settings · Connect Platform
── Footer ──
Avatar + nama + role · Settings icon (shortcut ke tab Keamanan/Settings)
```
> Catatan: "Support" dihapus dari Menu (lihat `business-plan.md` §9). "Pricing" dari draf awal jadi sub-tab "Paket Tersedia" di dalam **Billing**, bukan nav item sendiri. "Settings" naik jadi nav item penuh karena isinya (Team & Akses, Notifikasi, Keamanan) cukup banyak untuk halaman sendiri, di luar gear icon shortcut di footer.

## Konvensi Visual per Fitur
- **KPI card:** label kecil abu-abu di atas, angka besar bold, delta kecil (hijau untuk perubahan baik, merah untuk perubahan yang perlu perhatian — bukan badge solid, cukup teks kecil bold + panah).
- **Alert/anomaly card:** border kiri merah tebal (4px), bukan background merah penuh — supaya tetap tenang secara visual.
- **Status pill:** dot kecil + label, warna sesuai kategori semantik di atas.
- **Platform switcher (Detail Platform):** chip dengan ikon inisial platform, state aktif = amber solid.
- **Insight card (AI Insight):** icon badge berwarna sesuai kategori (merah=anomali, amber=rekomendasi, hijau=positif), tag kategori + tag platform + tag **Impact** (merah=Tinggi, amber=Sedang, abu=Rendah), action link + feedback 👍/👎 (icon-only) di kanan bawah.
- **Priority summary (AI Insight):** panel "Rekomendasi Prioritas" di atas grid insight — reuse pola visual `brec-row` (icon bulat bernomor + judul + alasan singkat + action link), bukan komponen baru.
- **Compare bar (kalau dibutuhkan lagi):** kalau mode compare platform di-revive, style-nya per-metrik horizontal bar (2 bar berdampingan per platform, warna beda per platform) — bukan tabel biasa, lebih gampang di-scan dan konsisten sama pola bar di Benchmark Industri.

## Motion
- Transisi opacity sederhana antar stage (sign in → onboarding → dashboard), spinner untuk state loading/connecting/syncing — jangan berlebihan.

> Dokumen ini dipakai Design Consistency Agent (lihat `AGENTS.md`) untuk jaga konsistensi visual lintas fitur. Kalau ada perubahan arah desain lagi, update dokumen ini duluan sebelum lanjut build fitur baru.
