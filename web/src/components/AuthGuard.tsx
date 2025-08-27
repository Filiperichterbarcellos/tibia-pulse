'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseBrowser();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login');
      else setLoading(false);
    });

    // mantém em sincronia
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace('/login');
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (loading) return <div className="p-8">Carregando…</div>;
  return <>{children}</>;
}
