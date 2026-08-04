"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { queryClient } from "@/lib/query-client";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuthStore } from "@/stores/auth";

function AuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      setUser(user);
      setInitializing(false);
    });
    return unsubscribe;
  }, [setUser, setInitializing]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      {children}
    </QueryClientProvider>
  );
}
