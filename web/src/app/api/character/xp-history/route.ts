// web/src/app/api/character/xp-history/route.ts
import { NextResponse } from 'next/server';
import { supabaseRead } from '@/lib/supabaseRead';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name')?.trim();
    const days = Number(searchParams.get('days') ?? '14');

    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const sb = supabaseRead();
    const { data, error } = await sb
      .rpc('get_character_xp_history', { p_name: name, p_days: days });

    if (error) {
      console.error('xp-history rpc error', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    // retorna em ordem ASC pra ficar bonitinho na UI
    const asc = (data ?? []).slice().sort((a: any, b: any) => a.date.localeCompare(b.date));
    return NextResponse.json({ name, days, history: asc });
  } catch (e) {
    console.error('xp-history route error', e);
    return NextResponse.json({ error: 'Unhandled error' }, { status: 500 });
  }
}
