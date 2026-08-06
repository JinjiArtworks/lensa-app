"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { useUserProfile } from "@/features/auth/api/use-user-profile";
import { useBusinesses } from "@/features/app-shell/api/use-businesses";
import { useLogout } from "@/features/auth/use-logout";

// Split out from Nav so the Firestore SDK it pulls in (useUserProfile,
// useBusinesses) only loads for visitors who are actually logged in — Nav
// itself only depends on the already-global useAuthStore, keeping the
// public landing/legal pages' bundle free of Firestore for anonymous
// visitors (the common case).
export function NavAccountActions({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useUserProfile(user?.uid);
  const { data: businesses } = useBusinesses(user?.uid);
  const displayName = profile?.name ?? user?.email?.split("@")[0] ?? "Pengguna";

  function goToDashboard() {
    onNavigate?.();
    const businessDoc = businesses?.[0];
    if (businessDoc) useUiStore.getState().setActiveBusinessId(businessDoc.id);
    router.push((businessDoc?.connectedPlatforms?.length ?? 0) > 0 ? "/overview" : "/onboarding");
  }

  if (variant === "mobile") {
    return (
      <>
        <div className="px-2 py-1.5 text-[13px] font-semibold text-ink-2">Halo, {displayName}</div>
        <Button className="mt-1 w-full justify-center" onClick={goToDashboard}>
          Ke Dashboard
        </Button>
        <Button variant="ghost" className="mt-1 w-full justify-center" onClick={logout}>
          <LogOut className="size-4" />
          Keluar
        </Button>
      </>
    );
  }

  return (
    <>
      <span className="text-[13px] font-semibold text-ink-2">Halo, {displayName}</span>
      <Button onClick={goToDashboard}>Ke Dashboard</Button>
      <button
        type="button"
        onClick={logout}
        title="Keluar"
        aria-label="Keluar"
        className="text-ink-3 hover:text-red"
      >
        <LogOut className="size-4" />
      </button>
    </>
  );
}
