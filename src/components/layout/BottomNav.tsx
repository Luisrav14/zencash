"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ArrowLeftRight, Wallet, CalendarClock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Inicio", icon: LayoutGrid },
  { href: "/transactions", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/budgets", label: "Sobres", icon: Wallet },
  { href: "/upcoming-payments", label: "Próximos", icon: CalendarClock },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
