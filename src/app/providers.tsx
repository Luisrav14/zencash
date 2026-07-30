"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/client/queryClient";
import { registerSyncListeners, flushPendingMutations } from "@/lib/client/syncManager";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  useEffect(() => {
    registerSyncListeners();
    void flushPendingMutations();

    // El Service Worker solo se registra en producción: en dev (Turbopack/HMR)
    // el cache-first del SW puede servir bundles viejos y causar loops de carga.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silenciar: el registro del SW no debe romper la app.
      });
    } else if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    }
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
