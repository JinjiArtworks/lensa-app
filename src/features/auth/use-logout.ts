"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useUiStore } from "@/stores/ui";

export function useLogout() {
  const router = useRouter();

  return async function logout() {
    try {
      await signOut(getFirebaseAuth());
      useUiStore.getState().setActiveBusinessId(null);
      useUiStore.getState().showToast("Berhasil keluar", "success");
      router.push("/sign-in");
    } catch {
      useUiStore.getState().showToast("Gagal keluar, coba lagi", "error");
    }
  };
}
