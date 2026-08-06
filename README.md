# Lensa

Satu dashboard untuk semua performa iklanmu — Meta Ads dan TikTok Ads digabung jadi satu tampilan yang jernih, lengkap dengan AI Insight yang menerjemahkan data jadi bahasa bisnis, bukan jargon marketing. Dibangun sebagai prototype untuk BDD Assessment (Sr. Frontend).

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Butuh project Firebase asli + `.env.local` terisi (lihat `.env.local.example`) supaya Auth/Firestore beneran jalan — tanpa itu, halaman publik & UI tetap bisa dilihat tapi sign up/sign in akan gagal.

```bash
npx tsc --noEmit   # type check
npm run build      # production build — juga verifikasi utama proyek ini
npm run lint       # ESLint
```

## Mau review project ini dari awal sampai selesai?

Semua proses development — dari ide produk, keputusan teknis, sampai apa yang beneran udah jadi — terdokumentasi di `docs/`. Urutan baca yang disarankan:

0. **[`docs/SUBMISSION.md`](docs/SUBMISSION.md)** — ringkasan submission assessment (produk & referensi, pendekatan, perubahan user flow & rationale, keputusan teknis, catatan deployment, catatan penggunaan AI). Mulai dari sini kalau cuma punya waktu buat baca 1 dokumen.
1. **[`docs/business-plan.md`](docs/business-plan.md)** — kenapa produk ini ada: positioning, target user, business model, dan batas scope yang eksplisit disepakati (apa yang IN, apa yang OUT).
2. **[`docs/PROGRESS.md`](docs/PROGRESS.md)** — catatan kronologis tiap sesi kerja: apa yang dibangun, kenapa, dan bagaimana diverifikasi. Ini sumber kebenaran status project — kalau ada dokumen lain yang kelihatan beda cerita, `PROGRESS.md` yang benar.
3. **[`docs/decisions-log.md`](docs/decisions-log.md)** — keputusan teknis non-obvious yang diambil, disusun per topik (bukan kronologis), tiap entry jawab "kenapa begini, bukan begitu" + trade-off yang sadar dilepas.
4. **[`docs/10-data-flow-reference.md`](docs/10-data-flow-reference.md)** & **[`docs/11-firebase-firestore-guide.md`](docs/11-firebase-firestore-guide.md)** — gimana data beneran mengalir: mana yang Firebase asli, mana yang mock/seeded, dan gimana consume/create/update/delete-nya.
5. **[`docs/feature-specs.md`](docs/feature-specs.md)** — spek per fitur yang jadi acuan waktu build (catatan: checklist di dalamnya acceptance criteria original, bukan status hidup — status terkini selalu di `PROGRESS.md`).
6. **[`docs/design-system.md`](docs/design-system.md)** & **[`docs/31-frontend-nextjs.md`](docs/31-frontend-nextjs.md)** — referensi teknis (design tokens, konvensi kode FE).
7. **`docs/plans/`** — appendix: transkrip eksekusi TDD step-by-step per sesi build, kalau butuh bukti detail proses (bukan bacaan wajib untuk paham cerita besarnya).

`CLAUDE.md` di root adalah versi ringkas dari semua ini, ditulis untuk AI assistant yang bantu kerja di repo ini — juga bisa dibaca manusia sebagai TL;DR teknis.

## Stack

Next.js 14 (App Router) + TypeScript strict + Tailwind + shadcn/ui + Firebase (Auth/Firestore) + TanStack Query + Zustand + Recharts.
