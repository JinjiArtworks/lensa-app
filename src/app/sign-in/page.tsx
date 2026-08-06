"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase/client";
import { mapFirebaseAuthError } from "@/lib/firebase/auth-errors";
import { signInSchema } from "@/features/auth/schemas";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useBusinesses } from "@/features/app-shell/api/use-businesses";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const { data: businesses } = useBusinesses(user?.uid);

  // Redirect an already-authenticated visitor before the form ever renders —
  // gating on `initializing` (and `user` while we're still resolving which
  // business/onboarding-state they land on) avoids the sign-in form flashing
  // for a moment before bouncing to the dashboard.
  useEffect(() => {
    if (initializing || !user || !businesses) return;
    const businessDoc = businesses[0];
    if (businessDoc) useUiStore.getState().setActiveBusinessId(businessDoc.id);
    router.replace((businessDoc?.connectedPlatforms?.length ?? 0) > 0 ? "/overview" : "/onboarding");
  }, [initializing, user, businesses, router]);

  if (initializing || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="size-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

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

      useUiStore.getState().showToast("Berhasil masuk", "success");
      const connectedPlatforms = (businessDoc?.data().connectedPlatforms ?? []) as string[];
      router.push(connectedPlatforms.length > 0 ? "/overview" : "/onboarding");
    } catch (error) {
      const message = mapFirebaseAuthError(error);
      setFormError(message);
      useUiStore.getState().showToast(message, "error");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-[380px] rounded-2xl border border-line bg-card p-8 shadow-sm">
        <form onSubmit={handleSignIn} className="text-center" noValidate>
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              className="w-full rounded-lg border border-line bg-gray-bg px-3 py-2.5 text-[13px] placeholder:text-ink-3"
            />
            {fieldErrors.email && <p className="mt-1 text-[11px] text-red">{fieldErrors.email}</p>}
          </div>
          <div className="mb-3 text-left">
            <label htmlFor="signin-password" className="mb-1 block text-xs font-semibold text-ink-2">
              Password
            </label>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password kamu"
                className="w-full rounded-lg border border-line bg-gray-bg px-3 py-2.5 pr-10 text-[13px] placeholder:text-ink-3"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
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
            <Link href="/sign-up" className="font-bold text-ink">
              Daftar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
