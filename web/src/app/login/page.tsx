// web/src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error(error.message);
      alert(error.message);
      return;
    }
    alert('Enviamos um link mágico para o seu e-mail.');
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          className="w-full border rounded p-2"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="rounded bg-black text-white px-4 py-2">Entrar</button>
      </form>
    </main>
  );
}
