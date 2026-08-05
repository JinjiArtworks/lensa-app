# Fitur: Business Switcher (Multi-Business, Pro Tier)

## Tujuan
1 user account bisa punya lebih dari 1 bisnis (Pro tier — di prototype ini di-assume sudah aktif). User switch konteks dashboard antar bisnis via switcher di sidebar.

## Step-by-step
1. Dropdown card di **sidebar** (bagian atas, di bawah logo) — nampilin nama bisnis aktif + plan (Free/Pro) + ikon panah.
2. Klik dropdown → list semua bisnis milik user (nama + inisial kecil) + opsi "+ Tambah Bisnis Baru" di paling bawah.
3. Pilih bisnis lain → seluruh state dashboard (Overview, Detail, AI Insight) re-scope ke `business_id` yang baru dipilih. Gunakan query key TanStack Query yang include `business_id` supaya cache per-bisnis terpisah.
4. Klik "+ Tambah Bisnis Baru":
   - Kalau Free tier → tampilkan upgrade prompt ke Pro (ngarah ke Pricing Page).
   - Kalau Pro tier (default assumption di prototype ini) → langsung bisa tambah bisnis baru: form simpel nama bisnis → redirect ke Connect Platform (`01-connect-platform-onboarding.md`) untuk bisnis baru itu.
5. Bisnis aktif terakhir disimpan (Zustand `ui` store atau Firestore user preference) supaya persist di reload/reload session berikutnya.

## Loading & Error State
- Switch bisnis: skeleton loading singkat di dashboard saat data bisnis baru di-fetch.

## Checklist Selesai
- [ ] Dropdown switcher ada di sidebar (bukan top nav)
- [ ] Data ter-scope benar per `business_id` (test: switch, pastikan data ngga ketuker)
- [ ] Free tier diblokir bikin bisnis ke-2 dengan upgrade prompt; Pro tier bebas nambah
- [ ] Bisnis aktif persist antar sesi
