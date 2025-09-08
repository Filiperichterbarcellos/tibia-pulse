"use client";

import Link from "next/link";

const items = [
  { href: "/worlds", label: "Worlds", icon: "🌍" },
  { href: "/character", label: "Buscar personagem", icon: "🧙" },
  { href: "/news", label: "Notícias", icon: "📰" },
  { href: "/tools", label: "Calculadoras", icon: "🧮" },
  { href: "/account", label: "Minha conta", icon: "⭐" },
];

export default function QuickNav() {
  return (
    <nav className="w-full bg-amber-700 text-white">
      <div className="mx-auto max-w-6xl px-4 h-12 flex items-center gap-3 overflow-x-auto">
        <div className="h-6 w-6 rounded-sm bg-[url('/favicon.ico')] bg-cover bg-center shrink-0" />
        <ul className="flex items-center gap-2">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                prefetch={false}
                href={it.href}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1.5"
              >
                <span className="text-base leading-none">{it.icon}</span>
                <span className="font-medium whitespace-nowrap">{it.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          {/* Switch dark (visual) */}
          <div className="h-7 w-14 rounded-full bg-white/30 relative">
            <div className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow" />
          </div>
        </div>
      </div>
    </nav>
  );
}
