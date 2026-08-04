"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { mapFirebaseAuthError } from "@/lib/firebase/auth-errors";
import { signUpSchema } from "@/features/auth/schemas";
import { createUserProfile, createDefaultBusiness } from "@/features/auth/firestore";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) router.push("/overview");
  }, [user, router]);

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
