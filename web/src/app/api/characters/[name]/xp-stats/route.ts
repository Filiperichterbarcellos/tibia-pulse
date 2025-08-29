import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// leitura: use ANON
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const name = params.name.toLowerCase()

    // ~40 dias para conseguir 31 deltas
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()

    const { data, error } = await supabase
      .from('character_xp_log')
      .select('captured_date, experience')
      .eq('name', name)
      .gte('captured_date', since)
      .order('captured_date', { ascending: true })

    if (error) throw error
    if (!data || data.length < 2) {
      return NextResponse.json({ days: [], average: null, best: null })
    }

    const gains: { date: string; gain: number }[] = []
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1]
      const cur = data[i]
      gains.push({
        date: String(cur.captured_date),
        gain: Math.max(0, Number(cur.experience || 0) - Number(prev.experience || 0)),
      })
    }

    const last = gains.slice(-31)
    const sum = last.reduce((a, b) => a + b.gain, 0)
    const avg = last.length ? Math.round(sum / last.length) : null
    const best = last.length ? Math.max(...last.map(g => g.gain)) : null

    return NextResponse.json({ days: last, average: avg, best })
  } catch (e: any) {
    console.error('[xp-stats] error:', e?.message || e)
    return NextResponse.json({ error: e?.message || 'stats failed' }, { status: 500 })
  }
}
