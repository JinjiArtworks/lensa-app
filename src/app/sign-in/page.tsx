"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase/client";
import { mapFirebaseAuthError } from "@/lib/firebase/auth-errors";
import { signInSchema, forgotPasswordSchema } from "@/features/auth/schemas";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "forgot-password">("sign-in");
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) router.push("/overview");
  }, [user, router]);

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
          <Link href="/sign-up" className="font-bold text-ink">
            Daftar
          </Link>{" "}
          ·{" "}
          <button type="button" onClick={() => setMode("forgot-password")} className="font-bold text-ink underline">
            Lupa password?
          </button>
        </div>
      </form>
    </div>
  );
}
