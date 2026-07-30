"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { useSession } from "@/lib/client/useSession";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col pb-24">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
