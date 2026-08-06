"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { BusinessCategory, BusinessDoc } from "@/lib/firebase/types";

async function fetchBusinesses(ownerId: string): Promise<BusinessDoc[]> {
  const snapshot = await getDocs(query(collection(getFirestoreDb(), "businesses"), where("ownerId", "==", ownerId)));
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BusinessDoc, "id">) }));
}

export function useBusinesses(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["businesses", ownerId],
    queryFn: () => fetchBusinesses(ownerId as string),
    enabled: Boolean(ownerId),
  });
}

export function useAddBusiness(ownerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, category }: { name: string; category: BusinessCategory }) => {
      const ref = await addDoc(collection(getFirestoreDb(), "businesses"), {
        ownerId,
        name,
        category,
        connectedPlatforms: [],
        plan: "free",
        createdAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses", ownerId] });
    },
  });
}
