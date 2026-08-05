"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { meRequest } from "@/lib/client/authClient";

export function useSession() {
  const router = useRouter();
  // Cacheada bajo una sola queryKey: evita refetch de /api/auth/me en cada pantalla/hook que la use.
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: meRequest,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && data === null) {
      router.replace("/login");
    }
  }, [isLoading, data, router]);

  const status: "loading" | "authenticated" | "unauthenticated" = isLoading ? "loading" : data ? "authenticated" : "unauthenticated";

  return { user: data ?? null, status };
}
