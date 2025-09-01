"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";

export default function UpdatePasswordPage() {
  const sb = supabaseBrowser();
  const sp = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Supabase envia ?code=... na URL; precisamos trocar pelo cookie de sessão
  useEffect(() => {
    const code = sp.get("code");
    if (!code) { setReady(true); return; }
    (async () => {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      setReady(true);
      if (error) setErr(error.message);
    })();
  }, [sb, sp]);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setErr(null); setMsg(null);
    const { error } = await sb.auth.updateUser({ password });
    setPending(false);
    if (error) setErr(error.message);
    else setMsg("Senha atualizada! Você já pode usar a nova senha para entrar.");
  }

  if (!ready) {
    return <main className="max-w-md mx-auto px-4 pt-16">Carregando…</main>;
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-16">
      <h1 className="text-2xl font-semibold mb-4">Definir nova senha</h1>
      <form onSubmit={updatePassword} className="space-y-3">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="nova senha"
          className="w-full rounded-xl border px-4 py-3"
        />
        <button
          disabled={pending}
          className="rounded-xl bg-black text-white px-4 py-3 w-full disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>

      {(msg || err) && (
        <div className={`mt-4 text-sm ${err ? "text-red-600" : "text-green-600"}`}>
          {err ?? msg}
        </div>
      )}
    </main>
  );
}
