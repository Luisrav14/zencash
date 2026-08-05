"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { useSession } from "@/lib/client/useSession";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
