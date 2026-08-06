"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { BusinessCategory, BusinessDoc } from "@/lib/firebase/types";

// Business docs created before the `plan` field existed have no such key in
// Firestore at all — `plan` has to be optional here, otherwise TS assumes
// it's always present and won't let the `?? "free"` default below do anything.
type BusinessFirestoreData = Omit<BusinessDoc, "id" | "plan"> & { plan?: BusinessDoc["plan"] };

async function fetchBusinesses(ownerId: string): Promise<BusinessDoc[]> {
  const snapshot = await getDocs(query(collection(getFirestoreDb(), "businesses"), where("ownerId", "==", ownerId)));
  return snapshot.docs.map((d) => {
    const data = d.data() as BusinessFirestoreData;
    // Missing `plan` must default to "free" (least-privileged), not fall
    // through to whatever a `=== "free" ? ... : "Pro"` check elsewhere
    // assumes for a non-"free" value — that inverted default is exactly what
    // made pre-migration businesses show up as "Pro" in the switcher.
    return { id: d.id, ...data, plan: data.plan ?? "free" };
  });
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
