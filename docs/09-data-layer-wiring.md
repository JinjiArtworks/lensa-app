# Fitur: Data Layer Wiring (Real API vs Mock Boundary)

> **Konteks:** semua fitur (00-08, sekarang digabung di `feature-specs.md`) sejauh ini di-build di atas mock data statis — belum ada Firebase Auth/Firestore beneran yang jalan (client SDK di `src/lib/firebase/client.ts` sudah ada tapi belum dipakai; `sign-in/page.tsx` masih `setTimeout` palsu, belum ada halaman sign-up). Ini milestone "wiring logic beneran" yang dicatat sebagai pending di `PROGRESS.md`. Dipicu oleh pertanyaan: platform ads (Meta/TikTok) API-nya nggak bisa diakses beneran (restriction), jadi perlu keputusan eksplisit — bagian mana yang di-wire ke API asli, bagian mana yang tetap mock tapi disajikan lewat arsitektur yang meyakinkan.

## Tujuan
Definisikan dengan jelas 3 kelas data di seluruh app, supaya nggak ambigu waktu eksekusi nanti: (A) real API (Firebase Auth + Firestore), (B) simulasi tapi disajikan lewat API layer (Route Handler/Server Action + TanStack Query), (C) tetap mock client murni. Dokumen ini adalah spec/keputusan arsitektur, bukan implementasi — jangan mulai coding dari file ini tanpa plan file terpisah (lihat `PROGRESS.md` / pola `plans/plan-YYYY-MM-DD-*.md`).

## A. Real API — Firebase Auth + Firestore

1. **Sign Up** — form (nama, email, password, konfirmasi) divalidasi Zod → `createUserWithEmailAndPassword` (Firebase Auth SDK, client-side, via `src/lib/firebase/client.ts`) → sukses → Firestore batch write: `users/{uid}` (profil) + `businesses/{businessId}` (dokumen bisnis default kosong, `ownerId: uid`, `connectedPlatforms: []`) → redirect `/onboarding`. Belum ada halaman sign-up sama sekali di kode saat ini — ini task baru, bukan cuma wiring page existing.
2. **Sign In** — `signInWithEmailAndPassword` → baca business doc terakhir aktif user dari Firestore → redirect: ada platform connected → `/overview`, belum ada → `/onboarding`. `sign-in/page.tsx` saat ini masih pakai `defaultValue` hardcoded + `setTimeout` — diganti total, bukan ditambal.
3. **Forgot Password** — `sendPasswordResetEmail`.
4. **Session bootstrap** — `onAuthStateChanged` listener dipasang sekali di root layout (client provider baru), sync ke `useAuthStore` (`src/stores/auth.ts`, sudah ada shape `{ user, setUser }`, tinggal dipanggil). Tampilkan loading skeleton sampai auth state resolve pertama kali (hindari flash of unauthenticated content).
5. **Route guard** — client-side check di `(dashboard)/layout.tsx`: belum login → redirect `/sign-in`. Sudah login tapi buka `/sign-in` → redirect ke dashboard. (Keputusan: client-side guard cukup untuk scope assessment ini — bukan middleware + Firebase session cookie + Admin SDK, itu overbuild untuk prototype single-review-cycle.)
6. **Connect Platform** — handshake OAuth ke Meta/TikTok **tetap simulasi** (nggak ada akses API asli — inilah restriction yang dimaksud). Tapi hasil status connect-nya ditulis ke Firestore (`businesses/{id}.connectedPlatforms`) beneran — survive refresh/reload, beda dari kondisi sekarang yang cuma local state React yang hilang begitu reload.
7. **Business Switcher** — baca list bisnis milik user dari Firestore query (`businesses` where `ownerId == uid`), bukan array statis di `mock-data.ts`.
8. Token **tidak** disimpan manual di localStorage — Firebase SDK yang urus persistence-nya sendiri (IndexedDB), sesuai golden rule di `feature-specs.md` §00 poin 5.

## B. Simulasi via API Layer — Route Handler/Server Action + TanStack Query

Ini jawaban langsung untuk keterbatasan akses API TikTok/Meta: data tetap mock, tapi *cara konsumsinya* meniru bentuk integrasi API asli, bukan cuma static import di komponen.

1. **Ads metrics** (`PLATFORMS` dan sejenisnya di `features/*/mock-data.ts`) — generator-nya dipindah ke server: `app/api/platform-metrics/route.ts` (Route Handler). Tambahkan delay artifisial 300-800ms + error-rate kecil (~5%, bisa di-toggle off untuk demo) supaya loading/error/retry state di UI benar-benar teruji, bukan selalu happy path.
2. FE fetch lewat `useQuery` (folder `features/<feature>/api/`, sesuai konvensi `31-frontend-nextjs.md`), query key `["platform-metrics", businessId, platformId, dateRange]`.
3. **AI Insight** (`insight-matcher.ts` logic) — dibungkus jadi endpoint/Server Action sendiri. Tombol "Sync & Analisis Ulang" jadi `useMutation` beneran, bukan `setTimeout` lokal. Logic pencocokan kondisi tetap deterministik/template-based sesuai keputusan `business-plan.md` §9 — **bukan** live AI generation, cuma pindah eksekusinya ke server-side call.
4. Kontrak (request/response shape) didesain supaya swap ke integrasi asli nanti = ganti isi handler doang, nggak nyentuh kode FE. Ini poin penting untuk narasi assessment: keterbatasan akses API dijawab dengan arsitektur yang siap-swap, bukan ditinggal sebagai hardcoded mock permanen.
5. **Data di-scope per `businessId`** (bukan 1 dataset statis global kayak sekarang) — generator di handler deterministik-seeded dari `businessId` (mis. seeded PRNG, bukan `Math.random()` murni, supaya angka konsisten tiap request untuk bisnis yang sama tapi beda antar bisnis). Ditemukan sebagai gap nyata setelah Part A (`plans/plan-2026-08-04-data-layer-wiring.md`) bikin Business Switcher Firestore-backed: tanpa ini, ganti bisnis di switcher nggak mengubah angka apapun di Overview/Detail Platform/AI Insight — keliatan seperti bug ("kok datanya sama aja"). **Keputusan: tidak disimpan ke Firestore** (supaya tetap jelas ini data yang didesain fake, bukan diam-diam jadi terasa seperti model data backend asli, sesuai `business-plan.md` §9) — cukup di-generate ulang tiap request dari seed.

## C. Tetap Mock Client Murni (tanpa roundtrip apapun)

- Billing/payment (Perpanjang Sekarang, checkout) — sudah eksplisit out-of-scope fungsional di `business-plan.md` §9, nggak berubah.
- Animasi "connecting..." Platform OAuth itu sendiri (spinner simulasi) — bukan network call apapun, cuma visual state; yang jadi real cuma *hasil akhirnya* (poin A.6 di atas).

## Testing

- `msw` (sudah ada di `devDependencies`, belum pernah dipakai) — pakai untuk mock `fetch` ke Route Handler baru (bagian B) di component test, dan untuk isolasi test dari network beneran.
- `firebase/auth` di-mock (`vi.mock`) di test alur A — CI nggak boleh butuh Firebase project asli buat lolos test.
- Manual/dev smoke test (bagian A) tetap butuh 1 Firebase project asli + `.env.local` terisi (lihat `.env.local.example`) — ini harus dibuat manual oleh developer (akun Google), nggak bisa di-provision oleh agent.

## Error Handling

- Firebase Auth error code di-map ke pesan ramah bahasa Indonesia lewat util kecil (`mapFirebaseAuthError` atau sejenis) — jangan tampilkan raw `error.code`/`error.message` dari Firebase, sesuai `feature-specs.md` §00.
- Route Handler (bagian B) gagal/timeout → TanStack Query error state → reuse toast system yang sudah ada (`stores/ui.ts` + `components/ui/toaster.tsx`) + tombol retry, bukan silent fail.

## Checklist Selesai

> Status per sesi keduabelas (2026-08-05). Detail "as-built" lengkap (gimana consume/create/update/delete-nya) ada di `10-data-flow-reference.md` — baca itu kalau butuh jawab pertanyaan detail, file ini cuma checklist tingkat tinggi.

- [x] Sign up (baru, belum ada halaman) + sign in (ganti total dari mock) + forgot password jalan via Firebase Auth SDK
- [x] Firestore: `users/{uid}`, `businesses/{id}` (termasuk `connectedPlatforms`) — dibaca & ditulis beneran, bukan mock. **Catatan: Create/Read/Update ada, Delete belum ada sama sekali** (nggak bisa hapus bisnis/disconnect platform/hapus akun) — gap yang diketahui, lihat `10-data-flow-reference.md`.
- [x] Session bootstrap (`onAuthStateChanged`) + route guard di `(dashboard)/layout.tsx`
- [x] Business Switcher baca dari Firestore, bukan array statis
- [x] Ads metrics disajikan lewat Route Handler + `useQuery` (bukan static import langsung ke komponen) — dan per sesi keduabelas, **semua** data (KPI, Campaign, Creative, Trend chart) sudah scoped per `businessId`, bukan cuma KPI seperti awalnya.
- [ ] AI Insight sync disajikan lewat endpoint/Server Action + `useMutation` — **scope-narrowed** (bukan skip): matching logic-nya tetap pure/client-side (nggak ada alasan pindah ke server), yang di-`useMutation`-kan cuma invalidate query `platform-metrics` yang jadi input-nya. Detail & alasan di `decisions-log.md` §3.5-3.6.
- [x] Delay + error-rate simulasi di Route Handler bagian B, dan loading/error/retry state di UI benar-benar teruji — error-rate di-wire tapi **off by default** (demo perlu happy path reliable), tinggal ubah 1 konstanta buat testing.
- [x] Billing/payment & animasi OAuth handshake tetap 100% client mock, tidak ikut di-wire
- [ ] ~~`msw` dipakai untuk mock fetch di test; `firebase/auth` di-mock di test~~ — **N/A**, seluruh automated test suite dihapus sesi kesebelas atas keputusan user (`decisions-log.md` §6.1). Verifikasi sekarang manual (`tsc`+`build`+curl smoke test).
- [x] Token tidak pernah disimpan manual ke localStorage
- [x] Firebase Auth error di-map ke pesan ramah, bukan raw error
