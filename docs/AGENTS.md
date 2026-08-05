# AGENTS.md — Lensa Project Alignment Config

> **Tujuan:** File ini WAJIB dibaca subagent/AI apapun sebelum mulai kerja di project Lensa. Fungsinya nge-guard supaya tiap output tetap align sama business planning yang udah didokumentasikan — jadi kamu (developer) cukup kasih instruksi singkat, agent yang urus konteksnya.

---

## 0. Source of Truth (baca urutan ini)

1. `business-plan.md` — nama produk, positioning, target user, business model, scope resmi (apa yang IN dan apa yang eksplisit OUT of scope).
2. `feature-specs.md` — spek step-by-step per fitur (§00-§08, digabung jadi 1 file 2026-08-05 — sebelumnya 9 file kecil terpisah). **Baca cuma section yang relevan sama task** (biar context tetap ringkas & fokus), bukan seluruh file. Catatan: checklist di dalamnya acceptance criteria original, bukan status hidup — status terkini selalu di `PROGRESS.md`.
3. `09-data-layer-wiring.md` — spek arsitektur data (real Firebase vs mock seeded), file sendiri karena lebih tebal & lebih baru dari `feature-specs.md`.
4. ~~`docs/00-engineering-standard.md`~~ — **file ini nggak pernah ada di project ini.** Draf awal dokumen ini merujuk ke "standar internal BDD" yang lebih luas yang nggak pernah dibawa masuk secara konkret ke project — jangan diasumsikan ada.
5. `31-frontend-nextjs.md` — konvensi kode FE (struktur folder, state, auth, dsb).

## 1. Aturan Alignment (WAJIB)

- **Sebelum bikin/ubah apapun:** cek dulu apakah request ini match sama scope di `business-plan.md` §5 (Fitur Inti) dan §9 (Assumptions & Scope).
- **Kalau request keluar dari scope** (misal diminta bikin fitur team-permission, payment gateway fungsional, atau fitur yang eksplisit ditandai "out of scope") → **STOP, jangan langsung build.** Kasih tau developer bahwa ini di luar scope yang udah disepakati, tanya konfirmasi sebelum lanjut.
- **Kalau request ambigu** (ngga jelas fitur yang mana) → cek dulu section mana di `feature-specs.md` (atau `09-data-layer-wiring.md` kalau soal data layer) yang paling relevan, sebutkan asumsi yang diambil, baru lanjut kerja.
- **Jangan overbuild.** Kalau spek fitur bilang "mock data" atau "simulasi", jangan diam-diam ganti jadi live API call — itu keputusan sadar yang udah didokumentasikan.

## 2. Role Subagent

**Aktif sejak sesi keduabelas (2026-08-05)** sebagai Claude Code subagent beneran di `.claude/agents/` — sebelumnya cuma dokumen desain di `docs/` yang nggak pernah beneran di-wire (nggak ada folder `.claude/agents/` sama sekali sampai titik itu; konsisten sama catatan di `PROGRESS.md` sesi kesebelas soal user milih eksekusi langsung/inline dibanding dispatch subagent).

| File | Role |
|---|---|
| `.claude/agents/lensa-orchestrator.md` | Terima request awal, cek scope, delegasikan |
| `.claude/agents/lensa-fe-builder.md` | Nulis komponen/page sesuai spek fitur |
| `.claude/agents/lensa-design-consistency.md` | Jaga konsistensi visual |
| `.claude/agents/lensa-reviewer.md` | Final check sebelum fitur dianggap selesai |

Claude Code otomatis mendeteksi subagent ini dari folder `.claude/agents/` — bisa dipanggil manual (`@lensa-orchestrator ...` atau lewat Agent tool dengan `subagent_type` sesuai `name` di frontmatter tiap file) atau otomatis kalau prompt-nya cocok sama `description`.

## 3. Cara Pakai (Workflow Harian)

1. Developer kasih instruksi singkat, contoh: *"buatin halaman Overview Dashboard-nya."*
2. Agent baca `business-plan.md` (kalau belum dalam context) → baca `feature-specs.md` §03 (Overview Dashboard) → baca `31-frontend-nextjs.md`.
3. Agent build sesuai step-by-step di file fitur, patuh golden rules.
4. Sebelum selesai, agent self-check pakai checklist di akhir tiap file fitur.
5. Kalau ada keputusan yang ngga ke-cover di dokumentasi → agent tanya, JANGAN asumsi sendiri diam-diam.

## 4. Yang TIDAK Boleh Agent Lakukan Tanpa Konfirmasi

- Nambah fitur yang ngga ada di `business-plan.md` §5.
- Ganti keputusan scope yang udah eksplisit ditulis (mis. "mock data", "bukan payment gateway fungsional").
- Ubah stack/library di luar yang udah ditentuin (`business-plan.md` §7).
- Ubah struktur nav dari top-center jadi side-nav (atau sebaliknya) tanpa diminta.

---

**Update terakhir:** dokumen ini dianggap read-only referensi. Kalau business plan berubah, update `business-plan.md` dulu, baru file ini di-refer ulang — jangan hardcode keputusan lama di sini.
