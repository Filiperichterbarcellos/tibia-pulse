"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    let mounted = true;

    // sessão atual
    (async () => {
      const { data } = await sb.auth.getSession();
      if (mounted) setSession(data.session);
    })();

    // listener de mudanças (login/logout)
    const { data: subscriptionContainer } = sb.auth.onAuthStateChange(
      (_event: AuthChangeEvent, newSession: Session | null) => {
        if (mounted) setSession(newSession);
      }
    );
    const subscription = subscriptionContainer.subscription;

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
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

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link href="/worlds" className="hover:text-amber-700">
            Worlds
          </Link>
          <Link href="/character" className="hover:text-amber-700">
            Buscar personagem
          </Link>
          <Link href="/news" className="hover:text-amber-700">
            Notícias
          </Link>
          <Link href="/tools" className="hover:text-amber-700">
            Calculadoras
          </Link>

          {session ? (
            <>
              <Link
                href="/account"
                className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
              >
                Minha conta
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-md bg-neutral-200 px-3 py-1.5 hover:bg-neutral-300"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
