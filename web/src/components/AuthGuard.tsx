"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Props = {
  children: React.ReactNode;
  redirectTo?: string; // padrão: /login
};

export default function AuthGuard({ children, redirectTo = "/login" }: Props) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sb = supabaseBrowser();

    let redirected = false;

    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== redirectTo) {
        redirected = true;
        router.replace(redirectTo);
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      if (!session && !redirected && pathname !== redirectTo) {
        redirected = true;
        router.replace(redirectTo);
      }
    });

    return () => {
      try {
        sub.subscription.unsubscribe();
      } catch {}
    };
  }, [router, pathname, redirectTo]);

  if (loading) {
    return (
      <div className="p-8 text-sm text-neutral-600">Carregando…</div>
    );
  }
  return <>{children}</>;
}
