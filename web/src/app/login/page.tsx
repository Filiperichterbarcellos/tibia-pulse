"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

type Providers = Record<string, { id: string; name: string; type: string }>;

export default function LoginPage() {
  const [providers, setProviders] = useState<Providers | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/providers");
        setProviders(await r.json());
      } catch {
        setProviders({});
      }
    })();
  }, []);

  const hasGoogle = !!providers?.google;
  const hasDiscord = !!providers?.discord;

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur rounded-2xl shadow p-6 border">
        {/* topo com logo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          {/* Se seu arquivo for .svg, troque para /auth-logo.svg */}
          <img
            src="/auth-logo.jpeg"
            alt="Tibia Pulse"
            width={96}
            height={96}
            className="rounded"
          />
          <h1 className="text-xl font-semibold">Entrar com</h1>
        </div>

        {/* botões */}
        <div className="space-y-3">
          {hasGoogle && (
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl py-3 border bg-white hover:bg-neutral-50 transition"
            >
              {/* Logo Google */}
              <svg width="20" height="20" viewBox="0 0 533.5 544.3" aria-hidden="true">
                <path fill="#4285F4" d="M533.5 278.4c0-18.4-1.7-36.1-4.9-53.2H272v100.8h146.9c-6.3 34.1-25 62.9-53.4 82.2v68h86.4c50.6-46.6 81.6-115.3 81.6-197.8z"/>
                <path fill="#34A853" d="M272 544.3c73.8 0 135.7-24.4 181-66.1l-86.4-68c-24 16.1-54.7 25.6-94.6 25.6-72.7 0-134.4-49-156.4-114.8H26.8v72.1C71.8 482.4 165.7 544.3 272 544.3z"/>
                <path fill="#FBBC05" d="M115.6 320.9c-5.5-16.4-8.6-33.9-8.6-52s3.1-35.6 8.6-52V144.8H26.8C9.6 180.3 0 221 0 264.3s9.6 84 26.8 119.5l88.8-63z"/>
                <path fill="#EA4335" d="M272 106.1c40 0 75.9 13.8 104.1 40.9l78.1-78.1C407.6 25.1 345.8 0 272 0 165.7 0 71.8 61.9 26.8 144.8l88.8 72.1C137.6 155.1 199.3 106.1 272 106.1z"/>
              </svg>
              <span>Google</span>
            </button>
          )}

          {hasDiscord && (
            <button
              onClick={() => signIn("discord", { callbackUrl: "/" })}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl py-3 text-white bg-[#5865F2] hover:bg-[#4752C4] transition"
            >
              {/* Mark oficial do Discord – fica nítido em 20x20 */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.608 1.25-1.836-.276-3.68-.276-5.515 0-.164-.395-.405-.875-.617-1.25a.077.077 0 00-.079-.037c-1.63.3-3.27.8-4.885 1.515a.07.07 0 00-.032.027C.533 9.045-.32 13.58.099 18.057a.082.082 0 00.031.055 19.9 19.9 0 006.002 3.06.078.078 0 00.084-.027c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.041-.105 13.128 13.128 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.009c.12.099.246.197.372.291a.077.077 0 01-.006.128c-.597.35-1.22.64-1.873.893a.076.076 0 00-.041.105c.36.698.772 1.363 1.225 1.994a.076.076 0 00.084.028 19.876 19.876 0 006.003-3.06.077.077 0 00.031-.054c.5-5.177-.838-9.673-3.548-13.661a.062.062 0 00-.031-.028zM8.02 15.331c-1.18 0-2.157-1.086-2.157-2.419 0-1.332.955-2.418 2.157-2.418 1.213 0 2.18 1.096 2.157 2.418-.023 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.18 0-2.157-1.086-2.157-2.419 0-1.332.955-2.418 2.157-2.418 1.213 0 2.18 1.096 2.157 2.418-.023 1.333-.955 2.419-2.157 2.419z"
                />
              </svg>
              <span>Discord</span>
            </button>
          )}
        </div>

        <p className="text-xs text-center text-gray-500 mt-6">
          Ao continuar, você concorda com nossos <span className="underline">Termos</span> e{" "}
          <span className="underline">Política de Privacidade</span>.
        </p>
      </div>
    </main>
  );
}
