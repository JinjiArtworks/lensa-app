"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { BusinessCategory, BusinessDoc } from "@/lib/firebase/types";

// Business docs created before the `plan` field existed have no such key in
// Firestore at all — `plan` has to be optional here, otherwise TS assumes
// it's always present and won't let the `?? "free"` default below do anything.
type BusinessFirestoreData = Omit<BusinessDoc, "id" | "plan"> & { plan?: BusinessDoc["plan"] };

// Firestore `Timestamp` on read (has `.toMillis()`), the `serverTimestamp()`
// sentinel on a not-yet-synced write, or missing entirely on old docs —
// `createdAt` is typed `unknown` precisely because it's one of these three,
// never a plain number/string.
function toMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return 0;
}

async function fetchBusinesses(ownerId: string): Promise<BusinessDoc[]> {
  const snapshot = await getDocs(query(collection(getFirestoreDb(), "businesses"), where("ownerId", "==", ownerId)));
  const businesses = snapshot.docs.map((d) => {
    const data = d.data() as BusinessFirestoreData;
    // Missing `plan` must default to "free" (least-privileged), not fall
    // through to whatever a `=== "free" ? ... : "Pro"` check elsewhere
    // assumes for a non-"free" value — that inverted default is exactly what
    // made pre-migration businesses show up as "Pro" in the switcher.
    return { id: d.id, ...data, plan: data.plan ?? "free" };
  });
  // Firestore's `where` query has no guaranteed order — callers (BusinessSwitcher's
  // account-plan gate, sign-in/sign-up's "pick a business to activate") rely on
  // index 0 being the business the owner registered first, so sort explicitly
  // rather than trusting insertion order.
  return businesses.sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
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
