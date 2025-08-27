'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function Navbar() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }) => setLogged(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLogged(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b">
      <nav className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <div className="flex gap-4">
          <Link href="/" className="font-semibold">TibiaPulse</Link>
          <Link href="/worlds" className="hover:underline">Worlds</Link>
          <Link href="/character" className="hover:underline">Buscar personagem</Link>
        </div>
        <div className="flex gap-3">
          {logged ? (
            <Link href="/account" className="hover:underline">Minha conta</Link>
          ) : (
            <Link href="/login" className="hover:underline">Entrar</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
