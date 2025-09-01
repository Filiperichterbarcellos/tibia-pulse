"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const sb = supabaseBrowser();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/account`
      : undefined;

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await sb.auth.getSession();
      if (mounted) setSession(data.session);
    })();

    const { data: subscriptionContainer } = sb.auth.onAuthStateChange(
      (_event: AuthChangeEvent, newSession: Session | null) => {
        if (mounted) {
          setSession(newSession);
        }
      }
    );
    const subscription = subscriptionContainer.subscription;

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sb]);

  async function loginEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setErr(null); setMsg(null);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) setErr(error.message);
    else window.location.href = "/account";
  }

  async function signupEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setErr(null); setMsg(null);
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    setPending(false);
    if (error) setErr(error.message);
    else setMsg("Conta criada! Verifique seu e-mail (se exigido) e depois faça login.");
  }

  async function sendResetEmail(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setErr(null); setMsg(null);
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/update-password`
          : undefined,
    });
    setPending(false);
    if (error) setErr(error.message);
    else setMsg("Enviamos um e-mail com o link para redefinir a senha. 👍");
  }

  async function signInGoogle() {
    setErr(null); setMsg(null);
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">Entrar</h1>

      {/* Google */}
      <div className="space-y-3">
        <button
          onClick={signInGoogle}
          className="w-full rounded-xl border px-4 py-3 text-left shadow-sm hover:shadow"
        >
          Entrar com Google
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-sm text-gray-500">ou</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      {mode === "login" && (
        <form onSubmit={loginEmailPassword} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-xl border px-4 py-3"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border px-4 py-3"
          />
          <button
            disabled={pending}
            className="rounded-xl bg-black text-white px-4 py-3 w-full disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => setMode("forgot")} className="underline">
              Esqueci minha senha
            </button>
            <button type="button" onClick={() => setMode("signup")} className="underline">
              Criar conta
            </button>
          </div>
        </form>
      )}

      {mode === "signup" && (
        <form onSubmit={signupEmailPassword} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-xl border px-4 py-3"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
            className="w-full rounded-xl border px-4 py-3"
          />
          <button
            disabled={pending}
            className="rounded-xl bg-black text-white px-4 py-3 w-full disabled:opacity-60"
          >
            {pending ? "Criando…" : "Criar conta"}
          </button>
          <div className="text-sm">
            Já tem conta?{" "}
            <button type="button" onClick={() => setMode("login")} className="underline">
              Entrar
            </button>
          </div>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={sendResetEmail} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-xl border px-4 py-3"
          />
          <button
            disabled={pending}
            className="rounded-xl bg-black text-white px-4 py-3 w-full disabled:opacity-60"
          >
            {pending ? "Enviando…" : "Enviar link de reset"}
          </button>
          <div className="text-sm">
            Lembrou a senha?{" "}
            <button type="button" onClick={() => setMode("login")} className="underline">
              Voltar ao login
            </button>
          </div>
        </form>
      )}

      {(msg || err) && (
        <div className={`mt-4 text-sm ${err ? "text-red-600" : "text-green-600"}`}>
          {err ?? msg}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6">
        Ao usar a plataforma, você concorda com nossos{" "}
        <a href="/terms" className="underline">Termos</a> e{" "}
        <a href="/privacy" className="underline">Política de Privacidade</a>.
      </p>
    </main>
  );
}
