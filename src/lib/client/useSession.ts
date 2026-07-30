"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { meRequest, type AuthUser } from "@/lib/client/authClient";

export function useSession() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    let active = true;

    meRequest().then((sessionUser) => {
      if (!active) return;
      if (sessionUser) {
        setUser(sessionUser);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
        router.replace("/login");
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  return { user, status };
}
