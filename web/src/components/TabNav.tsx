"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon?: string };

export default function TabNav({ items }: { items: Item[] }) {
  const pathname = usePathname();

  return (
    <div className="w-full bg-amber-600/10 border-b border-amber-200">
      <div className="mx-auto max-w-6xl px-4">
        <ul className="flex gap-2 h-11 items-center overflow-x-auto">
          {items.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-amber-600 text-white shadow"
                      : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200",
                  ].join(" ")}
                >
                  {icon && <span className="text-base">{icon}</span>}
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
