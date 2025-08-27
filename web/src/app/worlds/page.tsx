import { supabaseAnon } from '@/lib/supabaseServer';

export const revalidate = 60; // ISR: revalida a cada 60s

export default async function WorldsPage() {
  const db = supabaseAnon();
  const { data, error } = await db
    .from('worlds_online_snapshots')
    .select('world_name, online_count, captured_at')
    .order('captured_at', { ascending: false })
    .limit(500);

  if (error) return <div className="p-6">Erro: {error.message}</div>;

  // pega o snapshot mais recente de cada mundo
  const latest = new Map<string, { online: number; at: string }>();
  (data ?? []).forEach(r => {
    if (!latest.has(r.world_name)) {
      latest.set(r.world_name, {
        online: r.online_count,
        at: new Date(r.captured_at).toLocaleString(),
      });
    }
  });

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Worlds (online agora)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from(latest).map(([world, info]) => (
          <div key={world} className="rounded-2xl border p-4">
            <div className="text-lg font-semibold">{world}</div>
            <div className="text-4xl font-bold">{info.online}</div>
            <div className="text-xs opacity-70">Atualizado: {info.at}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
