import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TopBar({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] backdrop-blur",
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
