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

Rule yang **beneran aktif** di project ini, `firestore.rules` (root repo):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /businesses/{businessId} {
      allow read, update: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }
  }
}
```
Rule ini bilang: "dokumen `users/{uid}` cuma bisa dibaca/ditulis kalau yang lagi login itu punya `uid` yang sama." Tanpa rule kayak ini, secara default Firestore project baru itu "test mode" — **siapa aja yang tau project ID-nya bisa baca/tulis semua data**, nggak ada proteksi apapun.

**Status project ini (per 2026-08-05):** file `firestore.rules` udah ditulis di repo, tapi **publish ke Firebase Console-nya harus manual** (Firestore Database → tab Rules → paste → Publish) — itu butuh login Firebase developer sendiri, di luar hal yang bisa dikerjain otomatis. Cek `PROGRESS.md` buat status terkini udah di-publish atau belum.

## 7. Ringkasan analogi (buat cepat nginget)

| Pertanyaan | SQL | Firestore |
|---|---|---|
| Gimana declare "table"? | `CREATE TABLE` eksplisit, wajib sebelum insert | Nggak ada — collection muncul otomatis pas dokumen pertama ditulis |
| Di mana skema didefinisikan? | Di database-nya sendiri (DDL) | Di kode aplikasi (TS interface), cuma konvensi — nggak di-enforce Firestore |
| Gimana relasi antar data? | `FOREIGN KEY` + `JOIN` | Simpan ID sebagai field biasa (`ownerId`), query terpisah per collection, gabung manual di kode |
| Di mana password disimpan? | Kolom `password` (harus di-hash manual, rawan salah) | **Nggak pernah di Firestore** — Firebase Authentication yang urus, otomatis aman |
| Gimana ngunci akses data? | `GRANT`/permission di level DB | **Security Rules** (file terpisah, di-deploy sendiri) |
| ID dokumen/row | Biasanya auto-increment integer | String — bisa auto-generate (`addDoc`) atau kamu tentuin sendiri (`setDoc`, misal pakai `uid` dari Auth) |

## 8. Alur registrasi — kenapa "tiba-tiba" bisa kedaftar padahal nggak ada backend registrasi yang ditulis sendiri

Ini yang bikin Firebase kerasa "magic" — trace-nya persis di kode project ini:

```ts
// src/app/sign-up/page.tsx
const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
```

`createUserWithEmailAndPassword` itu fungsi dari Firebase Auth SDK. Di baliknya, dia kirim HTTPS POST ke `identitytoolkit.googleapis.com/v1/accounts:signUp?key=...` (endpoint sodaraan dari `accounts:lookup` yang dipanggil pas cek sesi login — bisa dilihat langsung di tab Network browser). **Google yang punya server itu** yang beneran bikin akunnya, hash password-nya, simpen di sistem Auth mereka, terus balikin `credential.user.uid`.

Nggak pernah ada "endpoint registrasi" yang ditulis sendiri di project ini — karena Identity Toolkit-nya Google itu **sendiri** adalah backend registrasi-nya. Firebase Auth = nyewa backend auth yang udah jadi & battle-tested, bukan bikin dari nol.

Tapi — penting — **bikin profil di Firestore itu langkah TERPISAH, bukan otomatis:**

```ts
// masih di sign-up/page.tsx, baris setelah createUserWithEmailAndPassword
await createUserProfile(credential.user.uid, { name, email });
```

Firebase Auth cuma tau "ada akun dengan uid X" — dia nggak otomatis bikin dokumen apapun di Firestore. Kode aplikasi sendiri yang manggil `createUserProfile()` buat nulis ke `users/{uid}`. Dua sistem yang beda, disambungin manual lewat `uid`.

## 9. Di mana query "di-setting"? — nggak ada, ini function call biasa di kode

Nggak ada query builder UI di Firebase Console, nggak ada file config query terpisah. Query itu langsung function call dari SDK, nempel di komponen/hook yang butuh datanya:

```ts
// src/features/app-shell/api/use-businesses.ts
const snapshot = await getDocs(
  query(collection(getFirestoreDb(), "businesses"), where("ownerId", "==", ownerId))
);
```

Baca ini kayak baca SQL: `collection(db, "businesses")` = `FROM businesses`, `where("ownerId", "==", ownerId)` = `WHERE ownerId = ?`, `getDocs(...)` = eksekusi query-nya. Firestore Console cuma punya tab **Rules** (§6) dan **Indexes** (buat query kompleks yang butuh index gabungan — query 1-field kayak di atas otomatis kepake tanpa setup manual). Nggak ada tab "tulis query di sini".

## 10. Custom payload — nggak ada yang perlu "didaftarin" duluan

Nggak ada skema yang harus diupdate di tempat lain sebelum nulis field baru. Misal mau nambah field custom ke dokumen business:

```ts
await addDoc(collection(db, "businesses"), {
  ownerId,
  name,
  connectedPlatforms: [],
  createdAt: serverTimestamp(),
  industry: "fashion",   // ← tinggal tambah, langsung kesimpen
});
```

Field `industry` langsung ada di dokumennya begitu ditulis — nggak ada migration, nggak ada approve skema di tempat lain. Yang **disarankan** (bukan wajib teknis) cuma 2: (a) update interface TypeScript-nya (`BusinessDoc` di `src/lib/firebase/types.ts`) biar type-safe di kode, dan (b) kalau field itu perlu dibatasi siapa yang boleh nulis/baca, tambahin logic-nya di `firestore.rules` (§6) — soalnya rules nggak otomatis tau field baru itu "harus" divalidasi gimana, itu tetep manual.

## 11. Kenapa pakai Firebase — kelebihan & kekurangan

Firebase itu kategori **BaaS (Backend as a Service)** — bukan cuma database, tapi paket auth+database+hosting yang dikelola penuh oleh Google. Ini alasan generik kenapa BaaS/Firebase dipilih, plus alasan spesifik project ini (lihat juga `decisions-log.md` §2.2 buat versi ringkasnya).

### Kelebihan
- **Nggak perlu bangun backend sendiri.** Auth, database, hosting — semua dikelola Google. Buat project time-boxed (assessment, prototype), ini penghematan waktu yang besar banget dibanding nulis REST API + setup server sendiri.
- **Auth itu susah dibuat bener sendiri** — hashing password, session token, refresh token, reset password, rate-limiting brute-force — Firebase udah handle semua ini secara aman & battle-tested. Salah 1 langkah kalau bikin manual = lubang keamanan nyata.
- **Client SDK bisa langsung ngomong ke database dari browser** — nggak perlu bikin REST/GraphQL API layer sendiri buat CRUD simpel. Security Rules jadi pagar akses, bukan kode endpoint yang harus ditulis & dites satu-satu.
- **Scaling otomatis** — nggak ada capacity planning server, nggak ada DevOps buat nambah kapasitas baca/tulis.
- **Free tier (Spark plan) generous** — cukup buat prototype/assessment tanpa biaya.
- **Real-time listener built-in** (`onSnapshot`) — kalau nanti butuh data yang update live tanpa refresh, tinggal pakai (project ini belum pakai, masih one-time read via TanStack Query, tapi kapabilitasnya ada).

### Kekurangan
- **Query terbatas** — nggak ada `JOIN`, agregasi lintas-dokumen terbatas. Sering harus denormalisasi (duplikasi data di banyak dokumen) buat hindari banyak round-trip — trade-off yang udah kelihatan di §4 (`ownerId` disimpan di tiap business doc, bukan di-JOIN dari user doc).
- **Vendor lock-in** — kode & pola data-nya nempel ke Firebase. Migrasi ke Postgres/backend custom nanti = rewrite beneran, bukan cuma ganti config.
- **Security Rules punya learning curve & gampang salah** — ini bukan teori, kejadian beneran di project ini: rules-nya sempet nggak ditulis sama sekali (masih default) sampai ditemukan pas ngecek deployment readiness. Beda dari kode backend biasa yang bisa di-unit-test, Rules itu DSL terpisah yang lebih susah ditest komprehensif.
- **API key ter-embed di client by design** — bukan bug, tapi konsekuensinya keamanan 100% bergantung ke Rules yang bener. Nggak ada opsi "sembunyiin backend" kayak server tradisional.
- **Harga bisa nggak terduga di skala besar** — bayar per baca/tulis/dokumen. Nggak masalah buat prototype kecil, tapi perlu direview kalau usernya udah banyak.
- **Testing butuh effort ekstra** — kode yang manggil Firebase SDK butuh di-mock (`vi.mock`) buat unit test, atau pakai Firebase Emulator Suite (belum di-setup di project ini) buat integration test yang lebih realistis.

### Kenapa project ini yang pilih Firebase (bukan cuma "karena gratis")
- Prinsip **"pilih profil infra paling kecil yang cukup"** — kebutuhan CRUD di sini (user, business) relatif sederhana, nggak butuh backend custom.
- Assessment ini time-boxed, solo developer — BaaS ngilangin bottleneck "bangun backend dulu" sepenuhnya.
- Sengaja **cuma** dipakai buat data yang genuinely real (Auth, user, business) — data ads/metrics yang emang mock **sengaja nggak** ditaruh di Firestore (`decisions-log.md` §3.4), biar nggak nyamain "data fake" jadi kerasa seperti "data backend asli". Ini nunjukin Firebase dipilih dengan judgment, bukan dipakai buta buat semua hal.

## File reference

| File | Isi |
|---|---|
| `src/lib/firebase/client.ts` | Init koneksi ke Firebase (App/Auth/Firestore) |
| `src/lib/firebase/types.ts` | "Skema" (interface TS) — `UserProfileDoc`, `BusinessDoc` |
| `src/features/auth/firestore.ts` | Fungsi nulis dokumen pertama (`createUserProfile`, `createDefaultBusiness`) |
| `src/app/sign-up/page.tsx` | Contoh Auth (password) + Firestore (profil) dipanggil berurutan |
| `src/features/app-shell/api/use-businesses.ts` | Contoh query baca (`where`, `getDocs`) |
| `src/features/connect-platform/api/use-connect-platform.ts` | Contoh update sebagian field (`updateDoc` + `arrayUnion`) |
| `firestore.rules` | Rules yang aktif (root repo) — status publish-nya di `PROGRESS.md` |

Lihat juga: `10-data-flow-reference.md` (gimana data ini dikonsumsi end-to-end, termasuk domain ads-metrics yang beda arsitektur total), `decisions-log.md` §2 (keputusan seputar Auth/route guard).
