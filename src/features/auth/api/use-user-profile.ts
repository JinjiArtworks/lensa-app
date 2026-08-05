"use client";

import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { UserProfileDoc } from "@/lib/firebase/types";

export function useUserProfile(uid: string | undefined) {
  return useQuery({
    queryKey: ["user-profile", uid],
    queryFn: async () => {
      const snapshot = await getDoc(doc(getFirestoreDb(), "users", uid as string));
      return snapshot.data() as UserProfileDoc | undefined;
    },
    enabled: Boolean(uid),
  });
}
