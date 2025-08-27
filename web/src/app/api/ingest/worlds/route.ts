import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

// v4 (v3 está deprecada)
const TIBIADATA_WORLDS = 'https://api.tibiadata.com/v4/worlds';

type World = {
  name: string;
  pvp_type: string | null;
  location: string | null;
  online_count: number;
};

export async function POST() {
  const db = supabaseAdmin(); // <- sobe pra usar também nos logs

  try {
    const res = await fetch(TIBIADATA_WORLDS, { cache: 'no-store' });
    if (!res.ok) {
      // loga falha de fetch
      await db.from('cron_logs').insert([
        { path: '/api/ingest/worlds', status: 502, message: `fetch failed (${res.status})` }
      ]);

      return NextResponse.json({ error: `fetch failed (${res.status})` }, { status: 502 });
    }

    const data = await res.json();

    // Tenta vários formatos possíveis do v4 (evita quebrar se mudarem chaves)
    const list: any[] =
      data?.worlds?.regular_worlds ??
      data?.worlds?.regular ??
      data?.worlds?.allworlds ??
      data?.worlds ??
      data?.worlds_list ??
      [];

    const worlds: World[] = list.map((w: any): World => ({
      name: w?.name ?? w?.world ?? 'Unknown',
      pvp_type: w?.pvp_type ?? w?.pvptype ?? w?.type ?? null,
      location: w?.location ?? w?.server_location ?? null,
      online_count: Number(
        w?.online ?? w?.players_online ?? w?.online_count ?? 0
      ),
    }));

    if (worlds.length) {
      await db.from('worlds').upsert(
        worlds.map(({ name, pvp_type, location }) => ({ name, pvp_type, location })),
        { onConflict: 'name' }
      );

      await db.from('worlds_online_snapshots').insert(
        worlds.map(({ name, online_count }) => ({
          world_name: name,
          online_count,
        }))
      );
    }

    // loga sucesso
    await db.from('cron_logs').insert([
      { path: '/api/ingest/worlds', status: 200, message: `Ingested ${worlds.length} worlds` }
    ]);

    return NextResponse.json({ worlds: worlds.length });
  } catch (e: any) {
    console.error('ingest/worlds error', e);

    // loga erro inesperado
    try {
      await db.from('cron_logs').insert([
        { path: '/api/ingest/worlds', status: 500, message: e?.message ?? 'internal error' }
      ]);
    } catch (_) {
      // evita quebrar o retorno se o insert do log também falhar
    }

    return NextResponse.json({ error: e?.message ?? 'internal error' }, { status: 500 });
  }
}
