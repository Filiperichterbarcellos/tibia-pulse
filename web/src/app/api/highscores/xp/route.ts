// web/src/app/api/highscores/xp/route.ts
import { NextResponse } from 'next/server';
import { supabaseRead } from '@/lib/supabaseRead';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const world = searchParams.get('world') || null;
    const limit = Number(searchParams.get('limit') ?? '50');

    const sb = supabaseRead();
    const { data, error } = await sb
      .rpc('get_xp_highscores', { p_date: date, p_world: world, p_limit: limit });

    if (error) {
      console.error('highscores rpc error', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    return NextResponse.json({ date, world, limit, rows: data ?? [] });
  } catch (e) {
    console.error('highscores route error', e);
    return NextResponse.json({ error: 'Unhandled error' }, { status: 500 });
  }
}
