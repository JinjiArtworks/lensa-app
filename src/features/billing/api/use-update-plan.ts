"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { BusinessPlan } from "@/lib/firebase/types";

export function useUpdateBusinessPlan(businessId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: BusinessPlan) => {
      await updateDoc(doc(getFirestoreDb(), "businesses", businessId as string), { plan });
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-plan", businessId] });
      // BusinessSwitcher reads `plan` off the separate `businesses` list
      // query (not `business-plan`) — without this it keeps showing the
      // pre-change plan until something else happens to refetch it.
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}
