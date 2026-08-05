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
    },
  });
}
