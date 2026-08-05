# Data Layer Wiring (Part A: Firebase Auth + Firestore) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fully-mocked auth flow (fake `setTimeout` sign-in, no sign-up page, in-memory-only connect-platform state) with real Firebase Auth + Firestore, per `09-data-layer-wiring.md` section A.

**Architecture:** Firebase Auth SDK (client-side, already bootstrapped at `src/lib/firebase/client.ts`) handles sign up/in/forgot-password. Firestore stores `users/{uid}` and `businesses/{businessId}` docs. TanStack Query (`queryClient` already exists, unused until now) reads Firestore as server state; Zustand (`auth` + `ui` stores, already exist) hold client/session state. A new `AuthGuard` protects `(dashboard)` routes client-side.

**Tech Stack:** Next.js 14 App Router, `firebase` ^12.17.0 (Auth + Firestore, modular SDK), `@tanstack/react-query` ^5.101.4, Zod ^4.4.3, Zustand ^5, Vitest + Testing Library (existing conventions: plain `test()`, no `describe`, `vi.mock` for module mocking).

## Global Constraints

- Firebase v12 modular SDK only (`firebase/app`, `firebase/auth`, `firebase/firestore`) — already installed, no version bump.
- Token never stored in `localStorage` — Firebase SDK's own persistence (IndexedDB) is the only persistence layer for the session.
- Route guard is **client-side only** — no Next.js middleware, no Firebase Admin SDK, no session cookies (explicit decision, `09-data-layer-wiring.md` §A.5 — Admin SDK/middleware is overbuild for this prototype).
- Firestore data model for this plan, no other collections: `users/{uid}` = `{ name: string, email: string, createdAt: Timestamp }`; `businesses/{businessId}` = `{ ownerId: string, name: string, connectedPlatforms: string[], createdAt: Timestamp }`.
- All new/modified UI copy in Bahasa Indonesia, matching existing pages' tone.
- `src/stores/` stays exactly `ui.ts` + `auth.ts` — extend their fields, never add a new store file (`31-frontend-nextjs.md`).
- TanStack Query hooks live in `src/features/<feature>/api/`; query keys always include their scoping id, e.g. `["businesses", ownerId]` (`31-frontend-nextjs.md`).
- No `any` without an inline comment explaining why it's unavoidable.
- Manual/dev smoke testing requires a real Firebase project + `.env.local` populated from `.env.local.example` — this must be provisioned by the developer (Google account), no agent can do this step.
- **Explicitly out of scope for this plan** (do not touch): the Route Handler/TanStack Query mock-API layer for ads metrics & AI insight (`09-data-layer-wiring.md` §B — separate plan later, touches `PLATFORM_RAW`/`insight-matcher.ts` shared across Overview/Detail-Platform/AI-Insight); `PlatformConnectionList.tsx` (in-dashboard reconnect/sync-status UI stays mock — only the onboarding connect flow gets Firestore-backed); Billing/payment (stays 100% mock per `business-plan.md` §9).

---

### Task 1: Firestore client + shared types + auth error mapper

**Files:**
- Modify: `src/lib/firebase/client.ts`
- Create: `src/lib/firebase/types.ts`
- Create: `src/lib/firebase/auth-errors.ts`
- Test: `src/lib/firebase/__tests__/auth-errors.test.ts`

**Interfaces:**
- Produces: `getFirestoreDb(): Firestore`, `mapFirebaseAuthError(error: unknown): string`, types `UserProfileDoc`, `BusinessDoc`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/firebase/__tests__/auth-errors.test.ts
import { mapFirebaseAuthError } from "../auth-errors";

test("maps known Firebase Auth error codes to friendly Indonesian messages", () => {
  expect(mapFirebaseAuthError({ code: "auth/email-already-in-use" })).toBe(
    "Email ini sudah terdaftar. Coba masuk, atau pakai email lain."
  );
  expect(mapFirebaseAuthError({ code: "auth/wrong-password" })).toBe("Email atau password salah.");
  expect(mapFirebaseAuthError({ code: "auth/user-not-found" })).toBe("Email atau password salah.");
});

test("falls back to a generic message for unknown error codes", () => {
  expect(mapFirebaseAuthError({ code: "auth/some-new-code" })).toBe("Terjadi kesalahan. Coba lagi sebentar lagi.");
});

test("falls back to a generic message for non-Firebase errors", () => {
  expect(mapFirebaseAuthError(new Error("boom"))).toBe("Terjadi kesalahan. Coba lagi sebentar lagi.");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- auth-errors`
Expected: FAIL — `Cannot find module '../auth-errors'`

- [ ] **Step 3: Implement the error mapper**

```ts
// src/lib/firebase/auth-errors.ts
const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Email ini sudah terdaftar. Coba masuk, atau pakai email lain.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/weak-password": "Password terlalu lemah, minimal 8 karakter.",
  "auth/user-not-found": "Email atau password salah.",
  "auth/wrong-password": "Email atau password salah.",
  "auth/invalid-credential": "Email atau password salah.",
  "auth/too-many-requests": "Terlalu banyak percobaan gagal. Coba lagi beberapa menit lagi.",
  "auth/network-request-failed": "Koneksi bermasalah. Cek internet kamu dan coba lagi.",
};

const DEFAULT_MESSAGE = "Terjadi kesalahan. Coba lagi sebentar lagi.";

function isFirebaseAuthError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && typeof (error as { code: unknown }).code === "string";
}

export function mapFirebaseAuthError(error: unknown): string {
  const code = isFirebaseAuthError(error) ? error.code : undefined;
  if (code && code in FIREBASE_AUTH_ERROR_MESSAGES) return FIREBASE_AUTH_ERROR_MESSAGES[code];
  return DEFAULT_MESSAGE;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- auth-errors`
Expected: PASS (3 tests)

- [ ] **Step 5: Add Firestore client getter and shared document types**

```ts
// src/lib/firebase/client.ts — add alongside existing getFirebaseApp/getFirebaseAuth
import { getFirestore, type Firestore } from "firebase/firestore";

let db: Firestore;

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
```

```ts
// src/lib/firebase/types.ts
export interface UserProfileDoc {
  name: string;
  email: string;
  createdAt: unknown; // Firestore serverTimestamp() sentinel on write, Timestamp on read
}

export interface BusinessDoc {
  id: string;
  ownerId: string;
  name: string;
  connectedPlatforms: string[];
  createdAt: unknown;
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/lib/firebase/client.ts src/lib/firebase/types.ts src/lib/firebase/auth-errors.ts src/lib/firebase/__tests__/auth-errors.test.ts
git commit -m "feat: add Firestore client getter, shared doc types, and Firebase Auth error mapper"
```

---

### Task 2: QueryClientProvider + Firebase Auth session bootstrap

**Files:**
- Modify: `src/stores/auth.ts`
- Create: `src/app/providers.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/app/__tests__/providers.test.tsx`

**Interfaces:**
- Consumes: `queryClient` from `src/lib/query-client.ts` (exists), `getFirebaseAuth()` from Task 1's file (exists already, untouched).
- Produces: `AppProviders` component; `useAuthStore` gains `initializing: boolean` and `setInitializing(v: boolean): void`.

- [ ] **Step 1: Extend the auth store with an `initializing` flag**

```ts
// src/stores/auth.ts
import { create } from "zustand";
import type { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  initializing: boolean;
  setUser: (user: User | null) => void;
  setInitializing: (initializing: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  setUser: (user) => set({ user }),
  setInitializing: (initializing) => set({ initializing }),
}));
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/app/__tests__/providers.test.tsx
import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";

let authCallback: ((user: unknown) => void) | null = null;

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, cb: (user: unknown) => void) => {
    authCallback = cb;
    return () => {};
  },
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseAuth: () => ({}),
}));

import { AppProviders } from "../providers";
import { useAuthStore } from "@/stores/auth";

beforeEach(() => {
  useAuthStore.setState({ user: null, initializing: true });
});

test("renders children immediately, without waiting for auth state", () => {
  render(
    <AppProviders>
      <div>Public content</div>
    </AppProviders>
  );
  expect(screen.getByText("Public content")).toBeInTheDocument();
});

test("syncs the resolved Firebase user into the auth store and flips initializing off", () => {
  const fakeUser = { uid: "user-1" } as never;
  render(
    <AppProviders>
      <div>Public content</div>
    </AppProviders>
  );

  act(() => {
    authCallback?.(fakeUser);
  });

  expect(useAuthStore.getState().user).toBe(fakeUser);
  expect(useAuthStore.getState().initializing).toBe(false);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- providers`
Expected: FAIL — `Cannot find module '../providers'`

- [ ] **Step 4: Implement AppProviders**

```tsx
// src/app/providers.tsx
"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { queryClient } from "@/lib/query-client";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuthStore } from "@/stores/auth";

function AuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      setUser(user);
      setInitializing(false);
    });
    return unsubscribe;
  }, [setUser, setInitializing]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      {children}
    </QueryClientProvider>
  );
}
```

Note: this does **not** gate rendering on `initializing` — public pages (landing, sign-in, sign-up) must not flash a loading spinner. Only the protected `(dashboard)` tree gates on it, via `AuthGuard` in Task 6.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- providers`
Expected: PASS (2 tests)

- [ ] **Step 6: Wire into the root layout**

```tsx
// src/app/layout.tsx — wrap the existing body content
import { AppProviders } from "./providers";
// ...existing imports unchanged...

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Run full suite + type-check**

Run: `npm run test && npx tsc --noEmit`
Expected: all existing tests still pass (pages are rendered directly in tests, not through `layout.tsx`, so this should be a no-op for them), no type errors

- [ ] **Step 8: Commit**

```bash
git add src/stores/auth.ts src/app/providers.tsx src/app/layout.tsx src/app/__tests__/providers.test.tsx
git commit -m "feat: wire QueryClientProvider and Firebase Auth session bootstrap at root layout"
```

---

### Task 3: Firestore writes for user profile + default business

**Files:**
- Create: `src/features/auth/firestore.ts`
- Test: `src/features/auth/__tests__/firestore.test.ts`

**Interfaces:**
- Consumes: `getFirestoreDb()` (Task 1), types `UserProfileDoc`/`BusinessDoc` (Task 1).
- Produces: `createUserProfile(uid: string, data: { name: string; email: string }): Promise<void>`, `createDefaultBusiness(ownerId: string): Promise<string>` (resolves to the new business doc id).

- [ ] **Step 1: Write the failing test**

```ts
// src/features/auth/__tests__/firestore.test.ts
import { vi } from "vitest";

const setDocMock = vi.fn();
const addDocMock = vi.fn().mockResolvedValue({ id: "business-123" });
const docMock = vi.fn((_db: unknown, ...pathSegments: string[]) => ({ path: pathSegments.join("/") }));
const collectionMock = vi.fn((_db: unknown, name: string) => ({ path: name }));

vi.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => docMock(...(args as [unknown, ...string[]])),
  setDoc: (...args: unknown[]) => setDocMock(...args),
  addDoc: (...args: unknown[]) => addDocMock(...args),
  collection: (...args: unknown[]) => collectionMock(...(args as [unknown, string])),
  serverTimestamp: () => "SERVER_TIMESTAMP",
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirestoreDb: () => ({}),
}));

import { createUserProfile, createDefaultBusiness } from "../firestore";

test("createUserProfile writes a users/{uid} doc with name, email, createdAt", async () => {
  await createUserProfile("uid-1", { name: "Sinta", email: "sinta@tokobaju.com" });

  expect(docMock).toHaveBeenCalledWith({}, "users", "uid-1");
  expect(setDocMock).toHaveBeenCalledWith(
    { path: "users/uid-1" },
    { name: "Sinta", email: "sinta@tokobaju.com", createdAt: "SERVER_TIMESTAMP" }
  );
});

test("createDefaultBusiness writes an empty business doc owned by uid and returns its id", async () => {
  const id = await createDefaultBusiness("uid-1");

  expect(collectionMock).toHaveBeenCalledWith({}, "businesses");
  expect(addDocMock).toHaveBeenCalledWith(
    { path: "businesses" },
    { ownerId: "uid-1", name: "Bisnis Saya", connectedPlatforms: [], createdAt: "SERVER_TIMESTAMP" }
  );
  expect(id).toBe("business-123");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- features/auth/__tests__/firestore`
Expected: FAIL — `Cannot find module '../firestore'`

- [ ] **Step 3: Implement**

```ts
// src/features/auth/firestore.ts
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";

export async function createUserProfile(uid: string, data: { name: string; email: string }): Promise<void> {
  await setDoc(doc(getFirestoreDb(), "users", uid), {
    name: data.name,
    email: data.email,
    createdAt: serverTimestamp(),
  });
}

export async function createDefaultBusiness(ownerId: string): Promise<string> {
  const ref = await addDoc(collection(getFirestoreDb(), "businesses"), {
    ownerId,
    name: "Bisnis Saya",
    connectedPlatforms: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- features/auth/__tests__/firestore`
Expected: PASS (2 tests)

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/firestore.ts src/features/auth/__tests__/firestore.test.ts
git commit -m "feat: add Firestore writes for user profile and default business creation"
```

---

### Task 4: Sign Up page (new)

**Files:**
- Create: `src/features/auth/schemas.ts`
- Create: `src/app/sign-up/page.tsx`
- Test: `src/app/sign-up/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `createUserProfile`, `createDefaultBusiness` (Task 3), `mapFirebaseAuthError` (Task 1), `useUiStore.setActiveBusinessId` (exists).
- Produces: `signUpSchema`, `signInSchema`, `forgotPasswordSchema` (Zod, all three defined here since they're small and colocated; Task 5 imports `signInSchema`/`forgotPasswordSchema` from this same file).

- [ ] **Step 1: Add the Zod schemas**

```ts
// src/features/auth/schemas.ts
import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/app/sign-up/__tests__/page.test.tsx
import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const createUserWithEmailAndPasswordMock = vi.fn();
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...args: unknown[]) => createUserWithEmailAndPasswordMock(...args),
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseAuth: () => ({}),
}));

const createUserProfileMock = vi.fn();
const createDefaultBusinessMock = vi.fn();
vi.mock("@/features/auth/firestore", () => ({
  createUserProfile: (...args: unknown[]) => createUserProfileMock(...args),
  createDefaultBusiness: (...args: unknown[]) => createDefaultBusinessMock(...args),
}));

import SignUpPage from "../page";
import { useUiStore } from "@/stores/ui";

beforeEach(() => {
  pushMock.mockClear();
  createUserWithEmailAndPasswordMock.mockReset();
  createUserProfileMock.mockReset();
  createDefaultBusinessMock.mockReset();
  useUiStore.setState({ activeBusinessId: null });
});

function fillForm({
  name = "Sinta",
  email = "sinta@tokobaju.com",
  password = "lensa1234",
  confirmPassword = "lensa1234",
} = {}) {
  fireEvent.change(screen.getByLabelText("Nama"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Konfirmasi Password"), { target: { value: confirmPassword } });
}

test("shows validation errors and does not call Firebase when the form is invalid", async () => {
  render(<SignUpPage />);
  fillForm({ password: "short", confirmPassword: "short" });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
  });

  expect(screen.getByText("Password minimal 8 karakter")).toBeInTheDocument();
  expect(createUserWithEmailAndPasswordMock).not.toHaveBeenCalled();
});

test("shows a mismatch error when passwords don't match", async () => {
  render(<SignUpPage />);
  fillForm({ confirmPassword: "different1" });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
  });

  expect(screen.getByText("Konfirmasi password tidak cocok")).toBeInTheDocument();
});

test("on valid submit, creates the Firebase user, the Firestore docs, sets the active business, and redirects to /onboarding", async () => {
  createUserWithEmailAndPasswordMock.mockResolvedValue({ user: { uid: "uid-1" } });
  createDefaultBusinessMock.mockResolvedValue("business-123");
  render(<SignUpPage />);
  fillForm();

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
  });

  expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith({}, "sinta@tokobaju.com", "lensa1234");
  expect(createUserProfileMock).toHaveBeenCalledWith("uid-1", { name: "Sinta", email: "sinta@tokobaju.com" });
  expect(createDefaultBusinessMock).toHaveBeenCalledWith("uid-1");
  expect(useUiStore.getState().activeBusinessId).toBe("business-123");
  expect(pushMock).toHaveBeenCalledWith("/onboarding");
});

test("shows a friendly error message when Firebase rejects sign up", async () => {
  createUserWithEmailAndPasswordMock.mockRejectedValue({ code: "auth/email-already-in-use" });
  render(<SignUpPage />);
  fillForm();

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
  });

  expect(screen.getByText("Email ini sudah terdaftar. Coba masuk, atau pakai email lain.")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- sign-up`
Expected: FAIL — `Cannot find module '../page'`

- [ ] **Step 4: Implement the page**

```tsx
// src/app/sign-up/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { mapFirebaseAuthError } from "@/lib/firebase/auth-errors";
import { signUpSchema } from "@/features/auth/schemas";
import { createUserProfile, createDefaultBusiness } from "@/features/auth/firestore";
import { useUiStore } from "@/stores/ui";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const result = signUpSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) errors[String(issue.path[0])] = issue.message;
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      await createUserProfile(credential.user.uid, { name, email });
      const businessId = await createDefaultBusiness(credential.user.uid);
      useUiStore.getState().setActiveBusinessId(businessId);
      router.push("/onboarding");
    } catch (error) {
      setFormError(mapFirebaseAuthError(error));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-[360px] text-center" noValidate>
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-ink">
          L
        </div>
        <h2 className="mb-1 text-[19px] font-extrabold">Daftar ke Lensa</h2>
        <p className="mb-6 text-xs text-ink-3">Satu dashboard buat semua platform iklanmu.</p>

        <div className="mb-3 text-left">
          <label htmlFor="signup-name" className="mb-1 block text-xs font-semibold text-ink-2">
            Nama
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
          {fieldErrors.name && <p className="mt-1 text-[11px] text-red">{fieldErrors.name}</p>}
        </div>

        <div className="mb-3 text-left">
          <label htmlFor="signup-email" className="mb-1 block text-xs font-semibold text-ink-2">
            Email
          </label>
          <input
            id="signup-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
          {fieldErrors.email && <p className="mt-1 text-[11px] text-red">{fieldErrors.email}</p>}
        </div>

        <div className="mb-3 text-left">
          <label htmlFor="signup-password" className="mb-1 block text-xs font-semibold text-ink-2">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
          {fieldErrors.password && <p className="mt-1 text-[11px] text-red">{fieldErrors.password}</p>}
        </div>

        <div className="mb-3 text-left">
          <label htmlFor="signup-confirm-password" className="mb-1 block text-xs font-semibold text-ink-2">
            Konfirmasi Password
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-[11px] text-red">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {formError && <p className="mb-3 text-[11px] text-red">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[12.5px] font-bold text-ink disabled:opacity-45"
        >
          {loading ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-ink/35 border-t-ink" />
          ) : (
            "Daftar"
          )}
        </button>
        <div className="mt-4 text-xs text-ink-3">
          Sudah punya akun?{" "}
          <a href="/sign-in" className="font-bold text-ink">
            Masuk
          </a>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- sign-up`
Expected: PASS (4 tests)

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 7: Commit**

```bash
git add src/features/auth/schemas.ts src/app/sign-up/page.tsx src/app/sign-up/__tests__/page.test.tsx
git commit -m "feat: add real Firebase sign-up page with Firestore user/business creation"
```

---

### Task 5: Sign In page (replace mock) + Forgot Password

**Files:**
- Modify: `src/app/sign-in/page.tsx` (full replace — old page has hardcoded `defaultValue` credentials and a fake `setTimeout`, nothing to incrementally keep)
- Modify: `src/app/sign-in/__tests__/page.test.tsx` (full replace — old tests assert the fake-timer/demo-value behavior being removed)

**Interfaces:**
- Consumes: `signInSchema`, `forgotPasswordSchema` (Task 4's `schemas.ts`), `mapFirebaseAuthError` (Task 1), `useUiStore.setActiveBusinessId`.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/sign-in/__tests__/page.test.tsx
import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const signInWithEmailAndPasswordMock = vi.fn();
const sendPasswordResetEmailMock = vi.fn();
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => signInWithEmailAndPasswordMock(...args),
  sendPasswordResetEmail: (...args: unknown[]) => sendPasswordResetEmailMock(...args),
}));

const getDocsMock = vi.fn();
vi.mock("firebase/firestore", () => ({
  collection: (_db: unknown, name: string) => ({ path: name }),
  query: (ref: unknown, ...clauses: unknown[]) => ({ ref, clauses }),
  where: (field: string, op: string, value: unknown) => ({ field, op, value }),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseAuth: () => ({}),
  getFirestoreDb: () => ({}),
}));

import SignInPage from "../page";
import { useUiStore } from "@/stores/ui";

beforeEach(() => {
  pushMock.mockClear();
  signInWithEmailAndPasswordMock.mockReset();
  sendPasswordResetEmailMock.mockReset();
  getDocsMock.mockReset();
  useUiStore.setState({ activeBusinessId: null });
});

function fillSignIn(email = "sinta@tokobaju.com", password = "lensa1234") {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
}

test("redirects to /onboarding and sets the active business when there's no connected platform yet", async () => {
  signInWithEmailAndPasswordMock.mockResolvedValue({ user: { uid: "uid-1" } });
  getDocsMock.mockResolvedValue({ docs: [{ id: "business-1", data: () => ({ connectedPlatforms: [] }) }] });

  render(<SignInPage />);
  fillSignIn();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
  });

  expect(useUiStore.getState().activeBusinessId).toBe("business-1");
  expect(pushMock).toHaveBeenCalledWith("/onboarding");
});

test("redirects to /overview when the user already has a connected platform", async () => {
  signInWithEmailAndPasswordMock.mockResolvedValue({ user: { uid: "uid-1" } });
  getDocsMock.mockResolvedValue({ docs: [{ id: "business-1", data: () => ({ connectedPlatforms: ["meta"] }) }] });

  render(<SignInPage />);
  fillSignIn();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
  });

  expect(pushMock).toHaveBeenCalledWith("/overview");
});

test("shows a friendly error message on wrong credentials, without navigating", async () => {
  signInWithEmailAndPasswordMock.mockRejectedValue({ code: "auth/wrong-password" });

  render(<SignInPage />);
  fillSignIn();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
  });

  expect(screen.getByText("Email atau password salah.")).toBeInTheDocument();
  expect(pushMock).not.toHaveBeenCalled();
});

test("switching to forgot-password mode and submitting sends a reset email", async () => {
  sendPasswordResetEmailMock.mockResolvedValue(undefined);

  render(<SignInPage />);
  fireEvent.click(screen.getByRole("button", { name: "Lupa password?" }));
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "sinta@tokobaju.com" } });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Kirim Link Reset" }));
  });

  expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({}, "sinta@tokobaju.com");
  expect(screen.getByText("Email reset password terkirim, cek inbox kamu.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- sign-in`
Expected: FAIL — old page doesn't have controlled/empty fields, no "Lupa password?" button, no Firebase calls

- [ ] **Step 3: Implement the replacement page**

```tsx
// src/app/sign-in/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase/client";
import { mapFirebaseAuthError } from "@/lib/firebase/auth-errors";
import { signInSchema, forgotPasswordSchema } from "@/features/auth/schemas";
import { useUiStore } from "@/stores/ui";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "forgot-password">("sign-in");
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) errors[String(issue.path[0])] = issue.message;
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const businessesSnapshot = await getDocs(
        query(collection(getFirestoreDb(), "businesses"), where("ownerId", "==", credential.user.uid))
      );
      const businessDoc = businessesSnapshot.docs[0];
      if (businessDoc) useUiStore.getState().setActiveBusinessId(businessDoc.id);

      const connectedPlatforms = (businessDoc?.data().connectedPlatforms ?? []) as string[];
      router.push(connectedPlatforms.length > 0 ? "/overview" : "/onboarding");
    } catch (error) {
      setFormError(mapFirebaseAuthError(error));
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldErrors({ email: result.error.issues[0].message });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      setResetSent(true);
    } catch (error) {
      setFormError(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  if (mode === "forgot-password") {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <form onSubmit={handleForgotPassword} className="w-full max-w-[360px] text-center" noValidate>
          <h2 className="mb-1 text-[19px] font-extrabold">Lupa Password</h2>
          <p className="mb-6 text-xs text-ink-3">Masukkan email kamu, kami kirim link reset password.</p>

          <div className="mb-3 text-left">
            <label htmlFor="reset-email" className="mb-1 block text-xs font-semibold text-ink-2">
              Email
            </label>
            <input
              id="reset-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
            />
            {fieldErrors.email && <p className="mt-1 text-[11px] text-red">{fieldErrors.email}</p>}
          </div>

          {resetSent && <p className="mb-3 text-[11px] text-green">Email reset password terkirim, cek inbox kamu.</p>}
          {formError && <p className="mb-3 text-[11px] text-red">{formError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[12.5px] font-bold text-ink disabled:opacity-45"
          >
            {loading ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-ink/35 border-t-ink" />
            ) : (
              "Kirim Link Reset"
            )}
          </button>
          <button type="button" onClick={() => setMode("sign-in")} className="mt-4 text-xs text-ink-3 underline">
            Kembali ke Masuk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <form onSubmit={handleSignIn} className="w-full max-w-[360px] text-center" noValidate>
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-ink">
          L
        </div>
        <h2 className="mb-1 text-[19px] font-extrabold">Masuk ke Lensa</h2>
        <p className="mb-6 text-xs text-ink-3">Lihat performa iklan semua platform dalam satu tempat.</p>

        <div className="mb-3 text-left">
          <label htmlFor="signin-email" className="mb-1 block text-xs font-semibold text-ink-2">
            Email
          </label>
          <input
            id="signin-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
          {fieldErrors.email && <p className="mt-1 text-[11px] text-red">{fieldErrors.email}</p>}
        </div>
        <div className="mb-3 text-left">
          <label htmlFor="signin-password" className="mb-1 block text-xs font-semibold text-ink-2">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
          {fieldErrors.password && <p className="mt-1 text-[11px] text-red">{fieldErrors.password}</p>}
        </div>

        {formError && <p className="mb-3 text-[11px] text-red">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[12.5px] font-bold text-ink disabled:opacity-45"
        >
          {loading ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-ink/35 border-t-ink" />
          ) : (
            "Masuk"
          )}
        </button>
        <div className="mt-4 text-xs text-ink-3">
          Belum punya akun?{" "}
          <a href="/sign-up" className="font-bold text-ink">
            Daftar
          </a>{" "}
          ·{" "}
          <button type="button" onClick={() => setMode("forgot-password")} className="font-bold text-ink underline">
            Lupa password?
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- sign-in`
Expected: PASS (4 tests)

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add src/app/sign-in/page.tsx src/app/sign-in/__tests__/page.test.tsx
git commit -m "feat: replace mock sign-in with real Firebase Auth + Firestore-based redirect logic, add forgot password"
```

---

### Task 6: Route guard (`AuthGuard`) + redirect-if-already-authenticated

**Files:**
- Create: `src/features/auth/components/AuthGuard.tsx`
- Test: `src/features/auth/components/__tests__/AuthGuard.test.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/sign-in/page.tsx` (add redirect-if-authenticated effect)
- Modify: `src/app/sign-in/__tests__/page.test.tsx` (add one test)
- Modify: `src/app/sign-up/page.tsx` (add redirect-if-authenticated effect)
- Modify: `src/app/sign-up/__tests__/page.test.tsx` (add one test)

**Interfaces:**
- Consumes: `useAuthStore` (`user`, `initializing` — both exist from Task 2).
- Produces: `AuthGuard` component.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/auth/components/__tests__/AuthGuard.test.tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

import { AuthGuard } from "../AuthGuard";
import { useAuthStore } from "@/stores/auth";

beforeEach(() => {
  replaceMock.mockClear();
});

test("shows a loading state and does not redirect while auth is still initializing", () => {
  useAuthStore.setState({ user: null, initializing: true });
  render(
    <AuthGuard>
      <div>Protected content</div>
    </AuthGuard>
  );
  expect(replaceMock).not.toHaveBeenCalled();
  expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
});

test("redirects to /sign-in once resolved with no signed-in user", () => {
  useAuthStore.setState({ user: null, initializing: false });
  render(
    <AuthGuard>
      <div>Protected content</div>
    </AuthGuard>
  );
  expect(replaceMock).toHaveBeenCalledWith("/sign-in");
  expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
});

test("renders children once resolved with a signed-in user", () => {
  useAuthStore.setState({ user: { uid: "uid-1" } as never, initializing: false });
  render(
    <AuthGuard>
      <div>Protected content</div>
    </AuthGuard>
  );
  expect(replaceMock).not.toHaveBeenCalled();
  expect(screen.getByText("Protected content")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- AuthGuard`
Expected: FAIL — `Cannot find module '../AuthGuard'`

- [ ] **Step 3: Implement AuthGuard**

```tsx
// src/features/auth/components/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) router.replace("/sign-in");
  }, [initializing, user, router]);

  if (initializing || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="size-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- AuthGuard`
Expected: PASS (3 tests)

- [ ] **Step 5: Wire into the dashboard layout**

```tsx
// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/features/app-shell/components/Sidebar";
import { TopBar } from "@/features/app-shell/components/TopBar";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen items-start">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <TopBar />
          <main className="mx-auto max-w-[1260px] px-7 py-6 pb-16 max-[640px]:px-4 max-[640px]:py-4">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
```

- [ ] **Step 6: Add redirect-if-already-authenticated to sign-in**

```tsx
// src/app/sign-in/page.tsx — add near the top of the component, after existing useState hooks
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
// ...inside SignInPage(), after existing hooks:
const user = useAuthStore((s) => s.user);
useEffect(() => {
  if (user) router.push("/overview");
}, [user, router]);
```

Add the matching test:

```tsx
// src/app/sign-in/__tests__/page.test.tsx — add import and one test
import { useAuthStore } from "@/stores/auth";
// ...
test("redirects an already signed-in user straight to /overview", () => {
  useAuthStore.setState({ user: { uid: "uid-1" } as never });
  render(<SignInPage />);
  expect(pushMock).toHaveBeenCalledWith("/overview");
});
```

Add `useAuthStore.setState({ user: null })` to this file's `beforeEach` so earlier tests aren't affected by store leakage.

- [ ] **Step 7: Add the same redirect to sign-up**

```tsx
// src/app/sign-up/page.tsx — same pattern as sign-in
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
// ...inside SignUpPage(), after existing hooks:
const user = useAuthStore((s) => s.user);
useEffect(() => {
  if (user) router.push("/overview");
}, [user, router]);
```

```tsx
// src/app/sign-up/__tests__/page.test.tsx — add import and one test
import { useAuthStore } from "@/stores/auth";
// ...
test("redirects an already signed-in user straight to /overview", () => {
  useAuthStore.setState({ user: { uid: "uid-1" } as never });
  render(<SignUpPage />);
  expect(pushMock).toHaveBeenCalledWith("/overview");
});
```

Add `useAuthStore.setState({ user: null })` to this file's `beforeEach` too.

- [ ] **Step 8: Run full suite + type-check + build**

Run: `npm run test && npx tsc --noEmit && npm run build`
Expected: all tests pass, no type errors, build succeeds

- [ ] **Step 9: Commit**

```bash
git add src/features/auth/components/AuthGuard.tsx src/features/auth/components/__tests__/AuthGuard.test.tsx \
  "src/app/(dashboard)/layout.tsx" src/app/sign-in/page.tsx src/app/sign-in/__tests__/page.test.tsx \
  src/app/sign-up/page.tsx src/app/sign-up/__tests__/page.test.tsx
git commit -m "feat: add client-side AuthGuard for dashboard routes and redirect signed-in users away from auth pages"
```

---

### Task 7: Firestore-backed Business Switcher

**Files:**
- Create: `src/features/app-shell/api/use-businesses.ts`
- Modify: `src/features/app-shell/components/BusinessSwitcher.tsx`
- Modify: `src/features/app-shell/components/__tests__/BusinessSwitcher.test.tsx`
- Modify: `src/features/app-shell/mock-data.ts` (remove now-unused `MockBusiness`/`MOCK_BUSINESSES`, keep `ActivityItem`/`MOCK_ACTIVITY`)

**Interfaces:**
- Consumes: `BusinessDoc` type (Task 1), `getFirestoreDb()` (Task 1), `useAuthStore` (Task 2), `useUiStore.activeBusinessId`/`setActiveBusinessId` (exist).
- Produces: `useBusinesses(ownerId: string | undefined)`, `useAddBusiness(ownerId: string | undefined)`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/app-shell/components/__tests__/BusinessSwitcher.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

const mutateMock = vi.fn();
vi.mock("../../api/use-businesses", () => ({
  useBusinesses: () => ({
    data: [
      { id: "toko-baju-sinta", ownerId: "uid-1", name: "Toko Baju Sinta", connectedPlatforms: ["meta"], createdAt: "" },
      { id: "warung-kopi-kita", ownerId: "uid-1", name: "Warung Kopi Kita", connectedPlatforms: [], createdAt: "" },
    ],
  }),
  useAddBusiness: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: (selector: (s: { user: { uid: string } }) => unknown) => selector({ user: { uid: "uid-1" } }),
}));

import { useUiStore } from "@/stores/ui";
import { BusinessSwitcher } from "../BusinessSwitcher";

beforeEach(() => {
  useUiStore.setState({ activeBusinessId: null });
  mutateMock.mockClear();
});

test("shows the active business name and plan", () => {
  render(<BusinessSwitcher />);
  expect(screen.getByText("Toko Baju Sinta")).toBeInTheDocument();
  expect(screen.getByText("Pro plan")).toBeInTheDocument();
});

test("clicking the switcher opens the dropdown listing all businesses", () => {
  render(<BusinessSwitcher />);
  fireEvent.click(screen.getByRole("button", { name: /Toko Baju Sinta/i }));
  expect(screen.getByText("Warung Kopi Kita")).toBeInTheDocument();
  expect(screen.getByText("+ Tambah Bisnis Baru")).toBeInTheDocument();
});

test("selecting a different business updates the active name", () => {
  render(<BusinessSwitcher />);
  fireEvent.click(screen.getByRole("button", { name: /Toko Baju Sinta/i }));
  fireEvent.click(screen.getByText("Warung Kopi Kita"));
  expect(screen.getAllByText("Warung Kopi Kita").length).toBeGreaterThan(0);
});

test("clicking + Tambah Bisnis Baru calls the add-business mutation", () => {
  render(<BusinessSwitcher />);
  fireEvent.click(screen.getByRole("button", { name: /Toko Baju Sinta/i }));
  fireEvent.click(screen.getByText("+ Tambah Bisnis Baru"));
  expect(mutateMock).toHaveBeenCalledWith("Bisnis Baru #3", expect.anything());
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- BusinessSwitcher`
Expected: FAIL — `Cannot find module '../../api/use-businesses'`

- [ ] **Step 3: Implement the query/mutation hooks**

```ts
// src/features/app-shell/api/use-businesses.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { BusinessDoc } from "@/lib/firebase/types";

async function fetchBusinesses(ownerId: string): Promise<BusinessDoc[]> {
  const snapshot = await getDocs(query(collection(getFirestoreDb(), "businesses"), where("ownerId", "==", ownerId)));
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BusinessDoc, "id">) }));
}

export function useBusinesses(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["businesses", ownerId],
    queryFn: () => fetchBusinesses(ownerId as string),
    enabled: Boolean(ownerId),
  });
}

export function useAddBusiness(ownerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const ref = await addDoc(collection(getFirestoreDb(), "businesses"), {
        ownerId,
        name,
        connectedPlatforms: [],
        createdAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses", ownerId] });
    },
  });
}
```

- [ ] **Step 4: Rewire the component**

```tsx
// src/features/app-shell/components/BusinessSwitcher.tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useAddBusiness, useBusinesses } from "../api/use-businesses";

function initialsOf(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function BusinessSwitcher() {
  const showToast = useUiStore((s) => s.showToast);
  const activeBusinessId = useUiStore((s) => s.activeBusinessId);
  const setActiveBusinessId = useUiStore((s) => s.setActiveBusinessId);
  const uid = useAuthStore((s) => s.user?.uid);
  const { data: businesses = [] } = useBusinesses(uid);
  const addBusiness = useAddBusiness(uid);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!activeBusinessId && businesses.length > 0) setActiveBusinessId(businesses[0].id);
  }, [activeBusinessId, businesses, setActiveBusinessId]);

  const active = businesses.find((b) => b.id === activeBusinessId) ?? businesses[0];
  if (!active) return null;

  return (
    <div className="relative mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={`${active.name} · Pro plan`}
        className="flex w-full items-center gap-2 rounded-lg border border-line bg-bg p-2.5 text-left max-[760px]:justify-center max-[760px]:p-1.5"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-[11px] font-bold text-accent-text">
          {initialsOf(active.name)}
        </span>
        <span className="min-w-0 flex-1 max-[760px]:hidden">
          <span className="block truncate text-[12.5px] font-bold leading-tight text-ink">{active.name}</span>
          <span className="block text-[10.5px] font-semibold text-accent-text">Pro plan</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-2 max-[760px]:hidden" />
      </button>

      {open && (
        <div className="absolute left-0 top-14 z-50 max-h-64 w-64 overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-lg max-[760px]:left-1">
          {businesses.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setActiveBusinessId(b.id);
                setOpen(false);
                showToast(`Ganti ke bisnis: ${b.name}`);
              }}
              className={`flex w-full items-center gap-2 rounded-lg p-2 text-left text-[12.5px] ${
                b.id === activeBusinessId ? "bg-accent-bg font-bold text-accent-text" : "hover:bg-bg"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10.5px] font-bold ${
                  b.id === activeBusinessId ? "bg-accent text-ink" : "bg-gray-bg text-ink-2"
                }`}
              >
                {initialsOf(b.name)}
              </span>
              {b.name}
            </button>
          ))}
          <hr className="my-1.5 border-line" />
          <button
            type="button"
            disabled={addBusiness.isPending}
            onClick={() =>
              addBusiness.mutate(`Bisnis Baru #${businesses.length + 1}`, {
                onSuccess: () => showToast("Bisnis baru ditambahkan"),
              })
            }
            className="w-full rounded-lg p-2 text-left text-[12.5px] font-bold text-accent-text hover:bg-bg disabled:opacity-45"
          >
            + Tambah Bisnis Baru
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Remove the now-unused mock export**

In `src/features/app-shell/mock-data.ts`, delete the `MockBusiness` interface and `MOCK_BUSINESSES` array; keep `ActivityItem`/`MOCK_ACTIVITY` (still used by the Activity Feed). Confirm nothing else references them:

Run: `grep -rn "MOCK_BUSINESSES\|MockBusiness" src`
Expected: no results outside the file just edited

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- BusinessSwitcher`
Expected: PASS (4 tests)

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 8: Commit**

```bash
git add src/features/app-shell/api/use-businesses.ts src/features/app-shell/components/BusinessSwitcher.tsx \
  src/features/app-shell/components/__tests__/BusinessSwitcher.test.tsx src/features/app-shell/mock-data.ts
git commit -m "feat: back Business Switcher with Firestore query/mutation instead of static mock array"
```

---

### Task 8: Firestore-backed Connect Platform status (onboarding)

**Files:**
- Create: `src/features/connect-platform/api/use-connect-platform.ts`
- Modify: `src/app/onboarding/page.tsx`
- Modify: `src/app/onboarding/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `getFirestoreDb()` (Task 1), `useUiStore.activeBusinessId` (exists, populated by Tasks 4/5/7).
- Produces: `useConnectedPlatforms(businessId: string | undefined)`, `useConnectPlatform(businessId: string | undefined)`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/onboarding/__tests__/page.test.tsx
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

let connectedPlatforms: string[] = [];
const mutateMock = vi.fn((platformKey: string, opts?: { onSettled?: () => void }) => {
  connectedPlatforms = [...connectedPlatforms, platformKey];
  opts?.onSettled?.();
});

vi.mock("@/features/connect-platform/api/use-connect-platform", () => ({
  useConnectedPlatforms: () => ({ data: connectedPlatforms }),
  useConnectPlatform: () => ({ mutate: mutateMock }),
}));

vi.mock("@/stores/ui", () => ({
  useUiStore: (selector: (s: { activeBusinessId: string }) => unknown) => selector({ activeBusinessId: "business-1" }),
}));

import OnboardingPage from "../page";

beforeEach(() => {
  connectedPlatforms = [];
  mutateMock.mockClear();
  pushMock.mockClear();
});

test("continue button is disabled until a platform connects", () => {
  render(<OnboardingPage />);
  expect(screen.getByRole("button", { name: "Lanjut ke dashboard" })).toBeDisabled();
});

test("clicking a platform row connects it after a delay by calling the Firestore mutation", () => {
  vi.useFakeTimers();
  render(<OnboardingPage />);
  act(() => {
    screen.getByText("Meta Ads").closest("button")!.click();
  });
  act(() => {
    vi.advanceTimersByTime(1100);
  });
  expect(mutateMock).toHaveBeenCalledWith("meta", expect.anything());
  vi.useRealTimers();
});

test("clicking continue navigates to /overview once a platform is connected", () => {
  connectedPlatforms = ["meta"];
  render(<OnboardingPage />);
  act(() => {
    screen.getByRole("button", { name: "Lanjut ke dashboard" }).click();
  });
  expect(pushMock).toHaveBeenCalledWith("/overview");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- onboarding`
Expected: FAIL — `Cannot find module '@/features/connect-platform/api/use-connect-platform'`

- [ ] **Step 3: Implement the hooks**

```ts
// src/features/connect-platform/api/use-connect-platform.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";

export function useConnectedPlatforms(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business-platforms", businessId],
    queryFn: async () => {
      const snapshot = await getDoc(doc(getFirestoreDb(), "businesses", businessId as string));
      return (snapshot.data()?.connectedPlatforms ?? []) as string[];
    },
    enabled: Boolean(businessId),
  });
}

export function useConnectPlatform(businessId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platformKey: string) => {
      await updateDoc(doc(getFirestoreDb(), "businesses", businessId as string), {
        connectedPlatforms: arrayUnion(platformKey),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-platforms", businessId] });
    },
  });
}
```

- [ ] **Step 4: Rewire the onboarding page**

```tsx
// src/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useUiStore } from "@/stores/ui";
import { useConnectPlatform, useConnectedPlatforms } from "@/features/connect-platform/api/use-connect-platform";

const PLATFORMS = [
  { key: "meta", name: "Meta Ads", sub: "Facebook & Instagram Ads", ic: "M" },
  { key: "tiktok", name: "TikTok Ads", sub: "TikTok for Business", ic: "TT" },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

export default function OnboardingPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const connectPlatform = useConnectPlatform(activeBusinessId);
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const router = useRouter();

  function connect(key: PlatformKey) {
    if (connectedPlatforms.includes(key) || connecting) return;
    setConnecting(key);
    setTimeout(() => {
      connectPlatform.mutate(key, { onSettled: () => setConnecting(null) });
    }, 1100);
  }

  const anyConnected = connectedPlatforms.length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-ink">
        L
      </div>
      <h2 className="mb-1.5 text-[19px] font-extrabold">Halo, Sinta — hubungkan platform iklanmu</h2>
      <p className="mb-6 max-w-[400px] text-[13px] text-ink-3">
        Sesuai plan Pro, kamu bisa hubungkan Meta Ads &amp; TikTok Ads sebagai platform inti. Klik salah satu buat
        mulai.
      </p>

      <div className="mb-5 flex w-full max-w-[420px] flex-col gap-2.5 text-left">
        {PLATFORMS.map((p) => {
          const isDone = connectedPlatforms.includes(p.key);
          const isConnecting = connecting === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => connect(p.key)}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                isDone ? "border-2 border-green bg-green-bg" : "border-line bg-card hover:border-accent"
              }`}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[11.5px] font-bold ${
                  isDone ? "bg-green text-white" : "bg-gray-bg text-ink-2"
                }`}
              >
                {p.ic}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold">{p.name}</div>
                <div className="mt-0.5 text-[11.5px] text-ink-3">{p.sub}</div>
              </div>
              {isConnecting ? (
                <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
              ) : (
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    isDone ? "border-green bg-green" : "border-line"
                  }`}
                >
                  {isDone && <Check className="size-3.5 text-white" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mb-5 text-xs text-ink-3">
        Plan Pro — hubungkan minimal 1 platform buat lanjut, bisa tambah platform lain kapan saja
      </div>

      <button
        type="button"
        disabled={!anyConnected}
        onClick={() => router.push("/overview")}
        className="rounded-lg bg-accent px-5 py-2.5 text-[12.5px] font-bold text-ink disabled:opacity-45"
      >
        Lanjut ke dashboard
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- onboarding`
Expected: PASS (3 tests)

- [ ] **Step 6: Run full suite + type-check + build**

Run: `npm run test && npx tsc --noEmit && npm run build`
Expected: all tests pass, no type errors, build succeeds (9 routes + new `/sign-up`)

- [ ] **Step 7: Commit**

```bash
git add src/features/connect-platform/api/use-connect-platform.ts src/app/onboarding/page.tsx src/app/onboarding/__tests__/page.test.tsx
git commit -m "feat: persist onboarding platform-connect status to Firestore"
```

---

## Self-Review Notes

- **Spec coverage** (`09-data-layer-wiring.md` §A): sign up ✅ (Task 4), sign in ✅ (Task 5), forgot password ✅ (Task 5), session bootstrap ✅ (Task 2), route guard ✅ (Task 6), connect-platform persistence ✅ (Task 8), Business Switcher from Firestore ✅ (Task 7), token never in localStorage ✅ (no task writes to localStorage anywhere), Firebase Auth errors mapped to friendly messages ✅ (Task 1, used in Tasks 4/5). §B (Route Handler/TanStack Query mock API layer) and the `msw` testing setup are explicitly deferred — flagged in Global Constraints, not silently dropped.
- **Cross-task wiring check:** `activeBusinessId` is set in three places (sign-up on business creation, sign-in on lookup, Business Switcher on first load) so `useConnectedPlatforms`/`useConnectPlatform` in Task 8 always have a business id to key off, even for a brand-new user who never renders `BusinessSwitcher` (it lives inside `(dashboard)`, onboarding doesn't) before reaching `/onboarding`.
- **Type/name consistency verified:** `BusinessDoc`/`UserProfileDoc` (Task 1) used identically in Tasks 3, 7, 8. `getFirestoreDb`/`getFirebaseAuth` names match between `client.ts` and every consumer. `mapFirebaseAuthError` signature (`unknown → string`) matches all call sites.

## Execution Handoff

Plan saved to `plan-2026-08-04-data-layer-wiring.md`. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Part B (ads metrics + AI insight via Route Handler/TanStack Query) is a separate, later plan — it touches `PLATFORM_RAW`/`insight-matcher.ts`, which is shared across Overview, Detail Platform, and AI Insight, so it deserves its own review cycle rather than being bolted onto this one.
