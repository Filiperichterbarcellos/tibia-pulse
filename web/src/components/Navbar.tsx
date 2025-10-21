"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const MENU: { href: string; label: string; icon?: string }[] = [
  { href: "/worlds", label: "Worlds", icon: "🌍" },
  { href: "/character", label: "Buscar personagem", icon: "🧙" },
  { href: "/calculators", label: "Calculadoras", icon: "🧮" }, // <- ajustado
  { href: "/stats", label: "Estatísticas", icon: "📈" },
  { href: "/bosses", label: "Bosses", icon: "👹" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const logged = !!session;

  function closeMenu() {
    setOpen(false);
  }

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" }); // ou "/login" se preferir
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 shadow" />
            <Link href="/" className="font-semibold text-lg">
              <span className="text-neutral-900">Tibia</span>
              <span className="text-amber-600">Pulse</span>
            </Link>
          </div>

          {/* Links Desktop */}
          <ul className="hidden md:flex items-center gap-6 text-sm">
            {MENU.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="hover:text-amber-700">
                  {it.label}
                </Link>
              </li>
            ))}

            {status !== "loading" && (
              logged ? (
                <>
                  <li>
                    <Link
                      href="/account"
                      className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
                    >
                      Minha conta
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
                    >
                      Sair
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/login"
                    className="rounded-md bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700"
                  >
                    Entrar
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* Botão Hambúrguer (Mobile) */}
          <button
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border hover:bg-neutral-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Drawer Mobile */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeMenu} />
          {/* painel */}
          <aside className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 shadow" />
                <span className="font-semibold">
                  Tibia<span className="text-amber-600">Pulse</span>
                </span>
              </div>
              <button
                aria-label="Fechar menu"
                onClick={closeMenu}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border hover:bg-neutral-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {MENU.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg border px-3 py-3 hover:bg-neutral-50"
                >
                  {it.icon && <span className="text-lg">{it.icon}</span>}
                  <span className="font-medium">{it.label}</span>
                </Link>
              ))}
            </div>

            {status !== "loading" && (
              <div className="mt-auto pt-4 border-t">
                {logged ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/account"
                      onClick={closeMenu}
                      className="flex-1 rounded-md border px-3 py-2 text-center hover:bg-neutral-50"
                    >
                      Minha conta
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); closeMenu(); }}
                      className="flex-1 rounded-md bg-amber-600 text-white px-3 py-2 hover:bg-amber-700"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block rounded-md bg-amber-600 text-white px-3 py-2 text-center hover:bg-amber-700"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
