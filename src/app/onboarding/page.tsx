"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { CreateBusinessModal } from "@/components/shared/CreateBusinessModal";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/features/auth/use-logout";
import { useUserProfile } from "@/features/auth/api/use-user-profile";
import { useBusinesses } from "@/features/app-shell/api/use-businesses";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function OnboardingPage() {
  const authUser = useAuthStore((s) => s.user);
  const { data: profile } = useUserProfile(authUser?.uid);
  const { data: businesses, isLoading } = useBusinesses(authUser?.uid);
  const setActiveBusinessId = useUiStore((s) => s.setActiveBusinessId);
  const router = useRouter();
  const logout = useLogout();
  const [modalOpen, setModalOpen] = useState(false);

  const name = profile?.name ?? authUser?.email?.split("@")[0] ?? "Pengguna";
  const email = authUser?.email ?? "";

  function goToDashboard(businessId: string) {
    setActiveBusinessId(businessId);
    router.push("/overview");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-ink">
        L
      </div>

      <div className="mb-6 flex w-full max-w-[420px] items-center gap-3 rounded-xl border border-line bg-card p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#ffe27a] text-[13px] font-bold text-ink">
          {initialsOf(name)}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate text-[13px] font-bold">{name}</div>
          <div className="truncate text-[11.5px] text-ink-3">{email}</div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-2 hover:border-red hover:text-red"
        >
          <LogOut className="size-3.5" />
          Keluar
        </button>
      </div>

      {isLoading ? (
        <span className="size-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      ) : !businesses || businesses.length === 0 ? (
        <>
          <h2 className="mb-1.5 text-[19px] font-extrabold">Belum ada bisnis</h2>
          <p className="mb-5 max-w-[400px] text-[13px] text-ink-3">
            Bikin bisnis pertama kamu buat mulai pakai Lensa — nama & kategori aja, platform iklan bisa dihubungkan
            belakangan lewat menu Binding.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-accent px-5 py-2.5 text-[12.5px] font-bold text-ink"
          >
            Buat Bisnis
          </button>
        </>
      ) : (
        <>
          <h2 className="mb-1.5 text-[19px] font-extrabold">Pilih bisnis kamu</h2>
          <p className="mb-5 max-w-[400px] text-[13px] text-ink-3">Lanjut ke dashboard buat bisnis yang dipilih.</p>
          <div className="mb-5 flex w-full max-w-[420px] flex-col gap-2.5 text-left">
            {businesses.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goToDashboard(b.id)}
                className="flex items-center gap-3 rounded-xl border border-line bg-card p-3 text-left hover:border-accent"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-bg text-[11.5px] font-bold text-ink-2">
                  {initialsOf(b.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold">{b.name}</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-3">{b.category}</div>
                </div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-extrabold ${
                    b.plan === "free" ? "bg-gray-bg text-ink-2" : "bg-accent text-ink"
                  }`}
                >
                  {b.plan === "free" ? "Free" : "Pro"}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <CreateBusinessModal open={modalOpen} onOpenChange={setModalOpen} ownerId={authUser?.uid} onCreated={goToDashboard} />
    </div>
  );
}
