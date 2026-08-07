"use client";

import { useAuthStore } from "@/stores/auth";
import { useBusinesses } from "@/features/app-shell/api/use-businesses";

// Single source of truth for "what's locked under Free" — used by Binding,
// AI Insight, Detail Platform's platform switcher, and export buttons, so the
// slot-limit rule can't drift between pages.
//
// Resolves through the account's PRIMARY business (first one ever
// registered — see BusinessSwitcher/Billing), never through whichever
// business happens to be active: `plan` lives on each business's own
// Firestore doc, but "Pro" is an account-wide subscription (feature-specs.md:
// "1 user account bisa punya lebih dari 1 bisnis"). A secondary business is
// always created with `plan: "free"` regardless of the account's real plan
// (see useAddBusiness) — reading off the active business instead of the
// primary one made every Pro-only feature read back as locked the moment you
// switched to a secondary business, even right after upgrading.
export function useProGate() {
  const uid = useAuthStore((s) => s.user?.uid);
  const { data: businesses = [] } = useBusinesses(uid);
  const plan = businesses[0]?.plan ?? "free";
  const isFree = plan === "free";

  function isPlatformLocked(isConnected: boolean, connectedCount: number, platformLimit: number): boolean {
    if (!isFree) return false;
    return !isConnected && connectedCount >= platformLimit;
  }

  return { isFree, plan, isPlatformLocked };
}
