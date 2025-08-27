'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';

export default function AccountPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <AuthGuard>
      <main className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Minha conta</h1>
        <p>Logado como: <b>{email}</b></p>

        <div className="space-x-2">
          <a href="/worlds" className="underline">Ver Worlds</a>
          <button onClick={signOut} className="rounded border px-3 py-1">Sair</button>
        </div>
      </main>
    </AuthGuard>
  );
}
