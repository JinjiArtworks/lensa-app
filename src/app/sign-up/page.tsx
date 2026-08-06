"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { mapFirebaseAuthError } from "@/lib/firebase/auth-errors";
import { signUpSchema } from "@/features/auth/schemas";
import { createUserProfile } from "@/features/auth/firestore";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useBusinesses } from "@/features/app-shell/api/use-businesses";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const { data: businesses } = useBusinesses(user?.uid);

  // Same "no flash" gating as sign-in — see that page for the full rationale.
  // Onboarding's job is now "does this user have a business yet", not
  // platform connection — that's Binding's concern, doesn't gate the
  // dashboard at all.
  useEffect(() => {
    if (initializing || !user || !businesses) return;
    const businessDoc = businesses[0];
    if (businessDoc) useUiStore.getState().setActiveBusinessId(businessDoc.id);
    router.replace(businessDoc ? "/overview" : "/onboarding");
  }, [initializing, user, businesses, router]);

  if (initializing || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="size-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

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
      useUiStore.getState().showToast("Akun berhasil dibuat", "success");
      router.push("/onboarding");
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
        <form onSubmit={handleSubmit} className="text-center" noValidate>
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
              placeholder="Nama lengkap kamu"
              className="w-full rounded-lg border border-line bg-gray-bg px-3 py-2.5 text-[13px] placeholder:text-ink-3"
            />
            {fieldErrors.name && <p className="mt-1 text-[11px] text-red">{fieldErrors.name}</p>}
          </div>

          <div className="mb-3 text-left">
            <label htmlFor="signup-email" className="mb-1 block text-xs font-semibold text-ink-2">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              className="w-full rounded-lg border border-line bg-gray-bg px-3 py-2.5 text-[13px] placeholder:text-ink-3"
            />
            {fieldErrors.email && <p className="mt-1 text-[11px] text-red">{fieldErrors.email}</p>}
          </div>

          <div className="mb-3 text-left">
            <label htmlFor="signup-password" className="mb-1 block text-xs font-semibold text-ink-2">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
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

          <div className="mb-3 text-left">
            <label htmlFor="signup-confirm-password" className="mb-1 block text-xs font-semibold text-ink-2">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password kamu"
                className="w-full rounded-lg border border-line bg-gray-bg px-3 py-2.5 pr-10 text-[13px] placeholder:text-ink-3"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
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
            <Link href="/sign-in" className="font-bold text-ink">
              Masuk
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
