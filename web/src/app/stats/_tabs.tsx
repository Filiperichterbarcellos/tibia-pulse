// src/app/stats/_tabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function tabClasses(active: boolean) {
  return [
    "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium",
    "transition-colors border",
    active
      ? "bg-amber-600 text-white border-amber-600 shadow"
      : "bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50",
  ].join(" ");
}

export default function StatsTabs() {
  const pathname = usePathname() || "";

  const isRankings = pathname.startsWith("/stats/rankings");
  const isHome = pathname === "/stats" || pathname === "/stats/";

  return (
    <div className="mx-auto max-w-6xl px-6 pt-4">
      <nav className="flex gap-3">
        <Link href="/stats" className={tabClasses(isHome)}>
          Estatísticas gerais
        </Link>

        <Link href="/stats/rankings" className={tabClasses(isRankings)}>
          Rankings
        </Link>
      </nav>
    </div>
  );
}
