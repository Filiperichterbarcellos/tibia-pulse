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

  // Supabase envia code na URL; trocamos por cookie de sessão
  useEffect(() => {
    // se por algum motivo o hook não retornou ainda:
    if (!sp) {
      setReady(true);
      return;
    }

    const code = sp.get("code");
    if (!code) {
      setReady(true);
      return;
    }

    (async () => {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      setReady(true);
      if (error) setErr(error.message);
      else setMsg("Sessão validada, defina sua nova senha.");
    })();
  }, [sb, sp]);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    setMsg(null);
    const { error } = await sb.auth.updateUser({ password });
    setPending(false);
    if (error) setErr(error.message);
    else setMsg("Senha atualizada com sucesso.");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Atualizar senha</h1>

      {!ready ? (
        <p className="text-sm text-zinc-500">Validando sessão…</p>
      ) : (
        <form onSubmit={updatePassword} className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Nova senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border px-3 py-2"
              required
              minLength={6}
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl px-3 py-2 border"
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>

          {msg && <p className="text-sm text-emerald-600">{msg}</p>}
          {err && <p className="text-sm text-rose-600">{err}</p>}
        </form>
      )}
    </main>
  );
}
