"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { BusinessPlan } from "@/lib/firebase/types";

export function useConnectedPlatforms(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business-platforms", businessId],
    queryFn: async () => {
      const snapshot = await getDoc(doc(getFirestoreDb(), "businesses", businessId as string));
      return (snapshot.data()?.connectedPlatforms ?? []) as string[];
    },
    enabled: Boolean(businessId),
  });
}

export function useBusinessPlan(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business-plan", businessId],
    queryFn: async () => {
      const snapshot = await getDoc(doc(getFirestoreDb(), "businesses", businessId as string));
      return (snapshot.data()?.plan ?? "free") as BusinessPlan;
    },
    enabled: Boolean(businessId),
  });
}

export function useConnectPlatform(businessId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platformKey: string) => {
      await updateDoc(doc(getFirestoreDb(), "businesses", businessId as string), {
        connectedPlatforms: arrayUnion(platformKey),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-platforms", businessId] });
    },
  });
}

// Overwrites connectedPlatforms with just this one key — arrayUnion only adds, this swaps the slot.
export function useSwitchPlatform(businessId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platformKey: string) => {
      await updateDoc(doc(getFirestoreDb(), "businesses", businessId as string), {
        connectedPlatforms: [platformKey],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-platforms", businessId] });
    },
  });
}
