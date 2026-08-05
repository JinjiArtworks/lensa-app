# Data Flow Reference (As-Built) — dari mana data datang, gimana cara consume/create/update/delete-nya

> Beda sama `09-data-layer-wiring.md`: file itu adalah **spec/rencana** yang ditulis sebelum implementasi (masih ada checklist `[ ]` yang belum semua tercentang). File ini adalah **catatan "as-built"** — apa yang beneran ada di kode sekarang (per sesi keduabelas, 2026-08-05), ditulis buat jadi bahan belajar & jawab pertanyaan interview soal arsitektur data. Kalau kode berubah lagi, update file ini juga.

## TL;DR — ada 2 domain data, jangan disamakan

| | Domain A: Auth & Business Identity | Domain B: Ads Metrics (KPI/Campaign/Creative/Trend) |
|---|---|---|
| **Sumber** | Firebase Auth + Firestore (**beneran, bukan mock**) | Route Handler `/api/platform-metrics` — generator seeded (**mock, deterministik**) |
| **Persisten?** | Ya, tersimpan di Firestore | **Tidak.** Dihitung ulang dari nol tiap request, nggak disimpan di database manapun |
| **Create** | Ada (sign up, tambah bisnis) | N/A — bukan data yang "dibuat", tapi digenerate on-the-fly |
| **Read** | Ada (query Firestore) | Ada (fetch endpoint) |
| **Update** | Ada, tapi cuma 1 field (`connectedPlatforms`) | N/A |
| **Delete** | **Belum ada sama sekali** | N/A — nggak ada yang disimpan buat dihapus |

Alasan kenapa didesain terpisah begini (bukan kelupaan): `business-plan.md` §9 & `decisions-log.md` — nggak ada akses API resmi Meta/TikTok untuk assessment ini, jadi ads metrics-nya fake by design. Kalau angka fake ini disimpan ke Firestore, bisa "diam-diam" keliatan seperti data backend asli — makanya sengaja **tidak** disimpan, murni hasil hitungan tiap request.

---

## Domain A — Firebase (Auth + Firestore, real)

### Struktur data
- **Firebase Auth** — akun user (email/password). Bukan Firestore, dikelola SDK-nya sendiri.
- **Firestore `users/{uid}`** — `{ name, email, createdAt }`
- **Firestore `businesses/{businessId}`** — `{ ownerId, name, connectedPlatforms: string[], createdAt }`

### Create
| Aksi | Trigger UI | Kode |
|---|---|---|
| Bikin akun + profil + bisnis default | Form Sign Up (`/sign-up`) | `createUserWithEmailAndPassword` (Firebase Auth SDK) → `createUserProfile()` (`setDoc users/{uid}`) → `createDefaultBusiness()` (`addDoc businesses`) — semua di `src/features/auth/firestore.ts`, dipanggil dari `src/app/sign-up/page.tsx:45-46` |
| Tambah bisnis baru (bisnis ke-2 dst) | "+ Tambah Bisnis Baru" di Business Switcher | `useAddBusiness()` hook → `addDoc` ke `businesses` — `src/features/app-shell/api/use-businesses.ts` |

### Read
| Aksi | Trigger UI | Kode |
|---|---|---|
| Nentuin redirect abis login (ada platform connected → `/overview`, belum → `/onboarding`) | Sign In | Query langsung di `src/app/sign-in/page.tsx:45-52`, `where ownerId == uid` |
| List bisnis milik user | Business Switcher | `useBusinesses(ownerId)` — `getDocs` query |
| Cek platform yang udah di-connect | Halaman Onboarding | `useConnectedPlatforms(businessId)` — `getDoc` 1 dokumen bisnis |
| Session/login state | Semua halaman dashboard (`AuthGuard`) | `onAuthStateChanged` listener di root provider → sync ke `useAuthStore` |

### Update
| Aksi | Trigger UI | Kode |
|---|---|---|
| Tandain 1 platform sebagai "connected" | Klik "Connect" di Onboarding | `useConnectPlatform(businessId)` mutation → `updateDoc` + `arrayUnion(platformKey)` pada field `connectedPlatforms` — `src/features/connect-platform/api/use-connect-platform.ts` |

Catatan: `arrayUnion` cuma **menambah** ke array, nggak pernah replace whole document — field lain (`name`, `ownerId`, dst) nggak ikut ketimpa.

### Delete
**Belum ada sama sekali.** Nggak ada `deleteDoc` di manapun di codebase (dicek langsung, 0 hasil). Konkretnya:
- Nggak bisa hapus bisnis dari Business Switcher.
- Nggak bisa disconnect platform yang udah ke-connect (nggak ada `arrayRemove`, cuma `arrayUnion`).
- Nggak bisa hapus akun/profil user.

Ini gap yang **diketahui**, bukan lupa — kalau ditanya di interview, jawabannya: "di luar scope prototype ini, dicatat sebagai next roadmap, belum ada urgensi karena flow demo nggak butuh delete."

---

## Domain B — Ads Metrics (mock, seeded — bukan Firebase, bukan database apapun)

Cakupan: KPI (spend/ROAS/CPA/CTR/dst), Campaign table, Creative list (per campaign), Trend chart (Overview & per-platform).

### Bagaimana angkanya "dibuat" (bukan Create dalam arti CRUD — ini generation, bukan persistence)

1. **Baseline** — konstanta hand-tuned yang didefinisikan langsung di `src/app/api/platform-metrics/route.ts`: `BASE_PLATFORM_RAW`, `BASE_CAMPAIGNS`, `BASE_CREATIVES`, `BASE_TREND_DATA`, `BASE_PLATFORM_TREND`. Ini **tidak pernah diserve langsung** ke client.
2. **Variasi per bisnis** — tiap field di-vary dari baseline pakai PRNG deterministik (`mulberry32`, di `src/features/overview-dashboard/lib/seed.ts`), di-seed dari string seperti `${businessId}:meta:current` atau `${businessId}:campaign-name`. Artinya:
   - **`businessId` yang sama → angka yang sama, setiap kali**, selamanya (nggak ada komponen waktu/random asli di seed-nya).
   - **`businessId` beda → angka beda.**
3. **Nggak disimpan di mana pun** — tiap kali endpoint dipanggil, angkanya dihitung ulang dari baseline + seed. Bukan cache, bukan database — murni fungsi matematika `f(businessId) → angka`.

### Bagaimana data dikonsumsi (Read)

```
Komponen (Overview/Detail/Insight)
  → useOverviewData(businessId)         [features/overview-dashboard/api/use-overview-data.ts]
    → TanStack Query, key ["platform-metrics", businessId]
    → fetch GET /api/platform-metrics?businessId=X
      → Route Handler generate angka seeded dari businessId
    → derivePlatformsData(response)      [features/overview-dashboard/mock-data.ts]
      → shape jadi KPI_ROW_1/2, PLATFORMS, CAMPAIGNS, CREATIVES, TREND_DATA, PLATFORM_TREND
  → di-passing sebagai props ke komponen anak (KpiGrid, CampaignTable, TrendChart, dst.)
```

Dipakai di `/overview`, `/detail`, dan `/insight` (AI Insight live-anomaly) — React Query dedupe otomatis berdasar query key, jadi 1 bisnis = 1 fetch yang di-share, bukan fetch ganda per halaman.

### "Edit" — sengaja nggak ada

Nggak ada tombol edit spend/CTR/campaign di UI manapun, dan ini keputusan sadar: data ini merepresentasikan metrik dari platform ads eksternal (Meta/TikTok) — bukan data yang "dimiliki" user buat diedit manual, cuma data yang **dilihat**.

**Tombol "Sync"** ada, tapi ini bukan generate ulang angka baru. Karena seed-nya cuma fungsi dari `businessId` (nggak ada waktu/random asli), invalidate+refetch bakal balikin angka yang **sama persis** kayak sebelumnya. Yang beneran terjadi pas klik Sync:
1. `stores/sync.ts` → `triggerSync()` — animasi loading ~1.3 detik, update label "terakhir sync" jadi "baru saja".
2. `queryClient.invalidateQueries(["platform-metrics", businessId])` — refetch endpoint (hasilnya identik ke request sebelumnya).

Penting buat dijelasin kalau ada yang notice "abis klik Sync kok angkanya nggak berubah" — **itu bukan bug**, itu emang deterministik by design (§B poin 5 di `09-data-layer-wiring.md`).

### "Delete" — nggak relevan

Nggak ada konsep hapus data ads metrics, karena nggak ada apapun yang disimpan buat dihapus. Satu-satunya cara "mengosongkan" data secara desain adalah disconnect platform di Firestore (Domain A) — tapi mutation itu juga belum dibuat (lihat Domain A → Delete).

---

## Jawaban singkat siap pakai (kalau ditanya soal ini)

- **"Datanya real dari Meta/TikTok?"** → Tidak, nggak ada akses API resmi (restriction di luar kendali, bukan pilihan). Angkanya di-generate deterministik per bisnis, tapi arsitektur konsumsinya (Route Handler + TanStack Query, bukan static import) dibuat identik dengan integrasi API asli — swap ke API beneran nanti = ganti isi Route Handler doang, kode FE nggak perlu diubah.
- **"Ganti bisnis di switcher, datanya beneran beda?"** → Ya — KPI, Campaign table, Creative list, Trend chart semua ikut berubah (bukan cuma KPI seperti awalnya, sudah full-migrasi sesi keduabelas), karena seed-nya pakai `businessId` sebagai kunci variasi.
- **"Bisa edit data campaign/CTR dari UI?"** → Sengaja nggak ada, karena bukan data yang dimiliki user (representasi metrik iklan eksternal).
- **"Ada fitur hapus bisnis / disconnect platform / hapus akun?"** → Belum — gap yang diketahui, dicatat sebagai next roadmap, bukan kelupaan.
- **"Auth & data bisnis disimpan di mana?"** → Firestore beneran (`users`, `businesses` collection) via Firebase SDK — bukan mock, beda arsitektur total dari ads metrics.
- **"Kenapa ads metrics nggak disimpan ke Firestore juga biar konsisten?"** → Keputusan sadar (`business-plan.md` §9): kalau data fake disimpan di database asli, bisa keliatan seolah itu representasi backend beneran — padahal sumbernya tetap generator, bukan integrasi API asli.

## File reference cepat

| File | Isi |
|---|---|
| `src/lib/firebase/client.ts` | Init Firebase App/Auth/Firestore |
| `src/lib/firebase/types.ts` | Tipe `UserProfileDoc`, `BusinessDoc` |
| `src/features/auth/firestore.ts` | `createUserProfile`, `createDefaultBusiness` |
| `src/features/app-shell/api/use-businesses.ts` | `useBusinesses`, `useAddBusiness` |
| `src/features/connect-platform/api/use-connect-platform.ts` | `useConnectedPlatforms`, `useConnectPlatform` |
| `src/app/api/platform-metrics/route.ts` | Baseline data + seeded generation, endpoint GET |
| `src/features/overview-dashboard/lib/seed.ts` | PRNG deterministik + fungsi-fungsi seeding |
| `src/features/overview-dashboard/mock-data.ts` | Tipe `PlatformMetricsResponse`/`OverviewData`, `derivePlatformsData()` |
| `src/features/overview-dashboard/api/use-overview-data.ts` | Hook `useOverviewData` (TanStack Query) |
| `src/stores/sync.ts` | State "Sync" (animasi + invalidate query) |

Lihat juga: `09-data-layer-wiring.md` (spec/rencana asli), `decisions-log.md` §1.2 & §3 (kenapa keputusan-keputusan di atas diambil), `PROGRESS.md` sesi kesebelas & keduabelas (kronologi eksekusinya).
