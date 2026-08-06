"use client";

import { useBusinessPlan } from "@/features/connect-platform/api/use-connect-platform";

// Single source of truth for "what's locked under Free" — used by Onboarding,
// and later Detail Platform's platform switcher + Connect Platform's list,
// so the slot-limit rule can't drift between pages.
export function useProGate(businessId: string | undefined) {
  const { data: plan = "free" } = useBusinessPlan(businessId);
  const isFree = plan === "free";

  function isPlatformLocked(isConnected: boolean, connectedCount: number, platformLimit: number): boolean {
    if (!isFree) return false;
    return !isConnected && connectedCount >= platformLimit;
  }

  return { isFree, plan, isPlatformLocked };
}
