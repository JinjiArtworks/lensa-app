# Panduan Firebase/Firestore — Gimana "Table"-nya Didefinisikan & Dipakai

> Ditulis buat jawab pertanyaan dasar: "cara declare table buat consume data gimana?" Jawaban pendeknya: **Firestore nggak punya konsep "declare table" sama sekali** — itu beda paradigma dari SQL. File ini jelasin dari nol, pakai contoh konkret dari project ini (`users`, `businesses`), plus koreksi 1 asumsi penting soal "table password".

## 1. Firestore itu NoSQL — nggak ada `CREATE TABLE`

Kalau di SQL (MySQL/Postgres), sebelum nyimpen data kamu HARUS declare schema dulu:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  password VARCHAR(255)
);
```
Firestore **nggak kerja kayak gitu**. Nggak ada langkah "declare struktur dulu". Struktur data (Collection → Document → Field) itu:

| SQL | Firestore |
|---|---|
| Database | Firestore instance (1 per Firebase project) |
| Table | **Collection** (misal `users`, `businesses`) |
| Row | **Document** (misal `users/abc123`) |
| Column | **Field** (misal `name`, `email`) |
| Schema (`CREATE TABLE`) | **Nggak ada.** Collection otomatis "muncul" begitu dokumen pertama ditulis ke situ. Nggak ada command "declare collection" yang berdiri sendiri. |

Artinya: kalau kamu jalanin kode yang nulis ke `collection(db, "produk")` padahal collection `produk` belum pernah ada sebelumnya, Firestore langsung bikinin — nggak ada error "table doesn't exist", nggak ada migration file yang perlu di-run duluan.

## 2. Jadi di mana "skema"-nya didefinisikan kalau bukan di Firestore?

Di **kode aplikasi**, sebagai TypeScript interface — ini cuma buat bantu development (autocomplete, type error kalau typo field), **bukan** dipaksakan oleh Firestore sendiri. Firestore tetap akan nerima dokumen apapun shape-nya walau interface-nya bilang lain, kalau kamu nulis lewat kode yang nggak sesuai interface.

Contoh di project ini, `src/lib/firebase/types.ts`:
```ts
export interface UserProfileDoc {
  name: string;
  email: string;
  createdAt: unknown;
}

export interface BusinessDoc {
  id: string;
  ownerId: string;
  name: string;
  connectedPlatforms: string[];
  createdAt: unknown;
}
```
Ini **bukan** schema yang di-enforce Firestore — ini cuma kontrak yang kita pegang sendiri di sisi kode, biar konsisten. Kalau mau ada enforcement beneran (mirip constraint SQL), itu lewat **Security Rules** (poin 6 di bawah), bukan lewat interface TypeScript ini.

## 3. Koreksi penting: nggak ada "table password"

Kamu nyebut contoh "table username & password" — ini poin yang paling penting buat dikoreksi karena beda banget cara kerjanya di Firebase:

**Password TIDAK PERNAH disimpan di Firestore.** Firebase punya 2 layanan yang benar-benar terpisah:

| Layanan | Ngurusin apa | Kepake di project ini |
|---|---|---|
| **Firebase Authentication** | Identitas: email + password (di-hash otomatis oleh Google, kita nggak pernah lihat/pegang hash-nya), token session, reset password | `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `sendPasswordResetEmail` |
| **Firestore** | Data lain seputar user yang KITA butuh (nama, preferensi, relasi ke data lain) | `users/{uid}` cuma nyimpen `{ name, email, createdAt }` — **nggak ada field password** |

Kenapa dipisah gini (dan ini best practice, bukan cuma pilihan project ini): password itu data sensitif yang butuh hashing+salting+rotation yang benar — kalau kita bikin sendiri (nyimpen manual di Firestore), risiko keamanannya tinggi banget kalau ada kesalahan implementasi. Firebase Auth udah handle itu semua secara otomatis & aman, kita tinggal panggil fungsinya, nggak pernah pegang password mentah/hash-nya sama sekali.

Alurnya di project ini (`src/app/sign-up/page.tsx`):
```ts
// 1. Password di-handle Firebase Auth — kita cuma kirim, nggak pernah nyimpen sendiri
const credential = await createUserWithEmailAndPassword(auth, email, password);

// 2. Firestore cuma nyimpen data profil TAMBAHAN yang Auth nggak punya tempatnya
await createUserProfile(credential.user.uid, { name, email });
```
`credential.user.uid` itu ID yang dikasih Firebase Auth — dipakai sebagai **document ID** di Firestore (`users/{uid}`), jadi 1 akun Auth = 1 dokumen profil Firestore, nyambung lewat `uid`, bukan lewat password.

## 4. Contoh nyata: gimana `users` & `businesses` "didefinisikan" & dipakai di project ini

Nggak ada file "schema.ts" terpusat yang di-run sebagai migration. Struktur collection itu muncul dari kode yang nulis ke situ:

**Nulis dokumen pertama kali (`src/features/auth/firestore.ts`) — ini yang secara efektif "mendefinisikan" bentuk collection-nya:**
```ts
export async function createUserProfile(uid: string, data: { name: string; email: string }) {
  await setDoc(doc(getFirestoreDb(), "users", uid), {
    name: data.name,
    email: data.email,
    createdAt: serverTimestamp(),
  });
  // ☝️ Baris ini yang "mendeclare" collection `users` — kalau ini
  // baris pertama yang pernah nulis ke `users`, Firestore bikin collection-nya
  // saat ini, di sini, tanpa langkah setup terpisah.
}

export async function createDefaultBusiness(ownerId: string): Promise<string> {
  const ref = await addDoc(collection(getFirestoreDb(), "businesses"), {
    ownerId,
    name: "Bisnis Saya",
    connectedPlatforms: [],
    createdAt: serverTimestamp(),
  });
  return ref.id; // Firestore generate ID random kalau pakai addDoc (bukan setDoc)
}
```

**Baca datanya balik (`src/features/app-shell/api/use-businesses.ts`):**
```ts
async function fetchBusinesses(ownerId: string) {
  const snapshot = await getDocs(
    query(collection(getFirestoreDb(), "businesses"), where("ownerId", "==", ownerId))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
```
Ini query-nya: "dari collection `businesses`, ambil semua dokumen yang field `ownerId`-nya sama dengan user yang login." Nggak ada `JOIN` di Firestore — kalau butuh data dari 2 collection sekaligus, kamu query 2x terpisah dan gabungin manual di kode (atau denormalisasi — simpan data yang sering dipakai bareng di 1 dokumen aja, biar nggak perlu query 2x).

## 5. Cara nambah collection/"table" baru sendiri (langkah generik)

Kalau ke depannya kamu butuh, misal, collection `notifications`:

1. **Tentuin bentuk datanya** — tulis interface TS-nya dulu (di `src/lib/firebase/types.ts` atau feature-nya masing-masing), ini dokumentasi buat diri sendiri, bukan langkah wajib teknis.
   ```ts
   export interface NotificationDoc {
     userId: string;
     message: string;
     read: boolean;
     createdAt: unknown;
   }
   ```
2. **Nulis dokumen pertama** — pakai `addDoc(collection(db, "notifications"), {...})` (ID auto-generate) atau `setDoc(doc(db, "notifications", customId), {...})` (ID kamu tentuin sendiri). Collection `notifications` otomatis "ada" setelah baris ini jalan.
3. **Query buat baca** — `getDocs(query(collection(db, "notifications"), where("userId", "==", uid)))`.
4. **(Penting, sering kelewat) Tulis Security Rule-nya** — lihat poin 6.

## 6. Security Rules — ini yang paling deket sama "constraint" ala SQL

Karena Firestore nggak punya schema enforcement, cara kamu "ngunci" struktur & akses data itu lewat **Firestore Security Rules** (file `firestore.rules`, di-deploy terpisah dari kode Next.js, lewat Firebase CLI/Console). Ini yang jawab pertanyaan "trus gimana caranya orang lain nggak bisa akses data user lain?"

Contoh rule (bukan yang aktif di project ini, cuma ilustrasi):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /businesses/{businessId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
  }
}
```
Rule ini bilang: "dokumen `users/{uid}` cuma bisa dibaca/ditulis kalau yang lagi login itu punya `uid` yang sama." Tanpa rule kayak ini, secara default Firestore project baru itu "test mode" — **siapa aja yang tau project ID-nya bisa baca/tulis semua data**, nggak ada proteksi apapun.

**Status project ini:** `PROGRESS.md` udah nyatet ini sebagai gap — Security Rules **belum ditulis**, masih default/test-mode. Ini bukan kelupaan teknis, tapi karena butuh 1 Firebase project asli yang di-provision manual (developer login sendiri), di luar hal yang bisa dikerjain otomatis. **Ini juga item yang tadi muncul di pilihan "next task" sebelumnya** (waktu milih antara ini vs full-migrasi mock data) — belum dikerjain, masih pending.

## 7. Ringkasan analogi (buat cepat nginget)

| Pertanyaan | SQL | Firestore |
|---|---|---|
| Gimana declare "table"? | `CREATE TABLE` eksplisit, wajib sebelum insert | Nggak ada — collection muncul otomatis pas dokumen pertama ditulis |
| Di mana skema didefinisikan? | Di database-nya sendiri (DDL) | Di kode aplikasi (TS interface), cuma konvensi — nggak di-enforce Firestore |
| Gimana relasi antar data? | `FOREIGN KEY` + `JOIN` | Simpan ID sebagai field biasa (`ownerId`), query terpisah per collection, gabung manual di kode |
| Di mana password disimpan? | Kolom `password` (harus di-hash manual, rawan salah) | **Nggak pernah di Firestore** — Firebase Authentication yang urus, otomatis aman |
| Gimana ngunci akses data? | `GRANT`/permission di level DB | **Security Rules** (file terpisah, di-deploy sendiri) |
| ID dokumen/row | Biasanya auto-increment integer | String — bisa auto-generate (`addDoc`) atau kamu tentuin sendiri (`setDoc`, misal pakai `uid` dari Auth) |

## File reference

| File | Isi |
|---|---|
| `src/lib/firebase/client.ts` | Init koneksi ke Firebase (App/Auth/Firestore) |
| `src/lib/firebase/types.ts` | "Skema" (interface TS) — `UserProfileDoc`, `BusinessDoc` |
| `src/features/auth/firestore.ts` | Fungsi nulis dokumen pertama (`createUserProfile`, `createDefaultBusiness`) |
| `src/app/sign-up/page.tsx` | Contoh Auth (password) + Firestore (profil) dipanggil berurutan |
| `src/features/app-shell/api/use-businesses.ts` | Contoh query baca (`where`, `getDocs`) |
| `src/features/connect-platform/api/use-connect-platform.ts` | Contoh update sebagian field (`updateDoc` + `arrayUnion`) |
| `firestore.rules` | **Belum ada di project ini** — kalau dibuat nanti, ini tempatnya |

Lihat juga: `10-data-flow-reference.md` (gimana data ini dikonsumsi end-to-end, termasuk domain ads-metrics yang beda arsitektur total), `decisions-log.md` §2 (keputusan seputar Auth/route guard).
