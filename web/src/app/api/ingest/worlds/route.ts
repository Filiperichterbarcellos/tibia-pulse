// web/src/app/api/ingest/worlds/route.ts
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

// Tipo "mínimo" para os objetos que vêm do v4
type TibiadataWorld = {
  name?: string;
  world?: string;
  pvp_type?: string;
  pvptype?: string;
  type?: string;
  location?: string;
  server_location?: string;
  online?: number;
  players_online?: number;
  online_count?: number;
};

type TibiadataResponse = {
  worlds?:
    | { regular_worlds?: TibiadataWorld[]; regular?: TibiadataWorld[]; allworlds?: TibiadataWorld[] }
    | TibiadataWorld[]
    | { worlds_list?: TibiadataWorld[] };
};

export async function POST() {
  try {
    const res = await fetch(TIBIADATA_WORLDS, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: `fetch failed (${res.status})` }, { status: 502 });
    }
    const data = (await res.json()) as TibiadataResponse;

    // Normaliza a lista independente da chave usada pela API
    const list: TibiadataWorld[] =
      (Array.isArray(data.worlds) ? data.worlds : undefined) ??
      (data.worlds && 'regular_worlds' in data.worlds ? data.worlds.regular_worlds : undefined) ??
      (data.worlds && 'regular' in data.worlds ? data.worlds.regular : undefined) ??
      (data.worlds && 'allworlds' in data.worlds ? data.worlds.allworlds : undefined) ??
      (data.worlds && 'worlds_list' in data.worlds ? data.worlds.worlds_list : undefined) ??
      [];

    const worlds: World[] = list.map((w: TibiadataWorld): World => ({
      name: w.name ?? w.world ?? 'Unknown',
      pvp_type: w.pvp_type ?? w.pvptype ?? w.type ?? null,
      location: w.location ?? w.server_location ?? null,
      online_count: Number(w.online ?? w.players_online ?? w.online_count ?? 0),
    }));

    const db = supabaseAdmin();

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

    return NextResponse.json({ worlds: worlds.length });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'internal error';
    console.error('ingest/worlds error', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
