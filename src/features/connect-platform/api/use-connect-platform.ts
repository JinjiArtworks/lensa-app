"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";

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
