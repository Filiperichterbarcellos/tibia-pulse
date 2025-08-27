'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.replace('/account');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado');
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      // redireciona automaticamente após OAuth
    } catch (err: any) {
      setError(err.message ?? 'Erro ao entrar com Google');
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold">
          {mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </h1>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              required
              className="mt-1 w-full rounded border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm">Senha</span>
            <input
              type="password"
              required
              className="mt-1 w-full rounded border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            disabled={busy}
            className="w-full rounded bg-black text-white py-2 font-medium disabled:opacity-60"
          >
            {busy ? 'Aguarde…' : (mode === 'signin' ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <button
          onClick={signInWithGoogle}
          className="w-full rounded border py-2"
          disabled={busy}
        >
          Entrar com Google
        </button>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-sm text-blue-600"
        >
          {mode === 'signin' ? 'Criar uma conta' : 'Já tenho conta — entrar'}
        </button>
      </div>
    </main>
  );
}
