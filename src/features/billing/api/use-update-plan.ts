"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { BusinessPlan } from "@/lib/firebase/types";

export function useUpdateBusinessPlan(businessId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: BusinessPlan) => {
      const ref = doc(getFirestoreDb(), "businesses", businessId as string);
      // Downgrading to Free has to re-enforce the 1-platform limit — Pro can
      // bind up to the full catalog, and nothing else clears the extras back
      // out on its own, so without this a downgraded business keeps every
      // platform it bound while on Pro instead of snapping back to just the
      // first one (the "permanent until upgrade" rule from Binding only
      // blocks adding a 2nd slot forward, it never runs backward on downgrade).
      if (plan === "free") {
        const snapshot = await getDoc(ref);
        const connectedPlatforms = (snapshot.data()?.connectedPlatforms ?? []) as string[];
        if (connectedPlatforms.length > 1) {
          await updateDoc(ref, { plan, connectedPlatforms: connectedPlatforms.slice(0, 1) });
          return plan;
        }
      }
      await updateDoc(ref, { plan });
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-plan", businessId] });
      // BusinessSwitcher reads `plan` off the separate `businesses` list
      // query (not `business-plan`) — without this it keeps showing the
      // pre-change plan until something else happens to refetch it.
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      // Downgrade may have trimmed connectedPlatforms too — Sidebar/Binding
      // both read that off this key, so it needs the same refresh.
      queryClient.invalidateQueries({ queryKey: ["business-platforms", businessId] });
    },
  });
}
