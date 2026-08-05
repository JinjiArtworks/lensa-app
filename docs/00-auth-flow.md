# Fitur: Auth Flow (Sign Up / Sign In)

> **Catatan:** fitur ini belum eksplisit dibahas di diskusi sebelumnya — ditambahkan karena semua fitur lain butuh user login dulu. Prasyarat teknis, bukan fitur yang dinilai UX-nya secara mendalam, tapi tetap harus ada & fungsional.

## Tujuan
User bisa daftar & login sebelum akses dashboard. Pakai Firebase Auth.

## Step-by-step
1. **Sign Up** — form: nama, email, password (+ konfirmasi password). Validasi via Zod (email valid, password min 8 char).
2. Setelah sign up sukses → buat 1 dokumen `user` di Firestore + 1 dokumen `business` default (kosong, belum ada platform connect) → redirect ke `Connect Platform` (lihat `01-connect-platform-onboarding.md`).
3. **Sign In** — email + password via Firebase Auth SDK. Redirect ke Overview Dashboard bisnis terakhir yang aktif (atau ke Connect Platform kalau belum ada platform yang terkoneksi).
4. **Forgot Password** — trigger Firebase `sendPasswordResetEmail`.
5. Session disimpan sesuai golden rule BDD: token di memory (Zustand `auth` store), refresh via Firebase SDK — **jangan** simpan token di localStorage.

## Loading & Error State
- Form submit: tombol disabled + spinner saat `isPending`.
- Error: pesan spesifik dari Firebase Auth error code (email sudah dipakai, password salah, dst) — jangan tampilin raw error object.

## Checklist Selesai
- [ ] Sign up, sign in, forgot password berfungsi
- [ ] Validasi form via Zod
- [ ] Token tidak di localStorage
- [ ] Redirect logic sesuai (ada bisnis aktif vs belum ada platform)
- [ ] Loading & error state ada di semua form
