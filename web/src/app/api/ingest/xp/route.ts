import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// SUPABASE (server-only): usar SERVICE ROLE
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// TODO: troque pela tua integração real (TibiaData v4)
async function fetchCharacter(name: string) {
  const r = await fetch(`https://api.tibiadata.com/v4/characters/${encodeURIComponent(name)}`)
  const data = await r.json()
  const c = data?.characters?.character
  if (!c?.name) throw new Error('Character not found')
  return {
    name: String(c.name),
    world: String(c.world),
    level: Number(c.level ?? 0),
    experience: typeof c.experience === 'number' ? c.experience : null,
  }
}

// fallback se a API não trouxer experience (aproximação)
function estimateExpFromLevel(level: number) {
  return Math.floor(Math.pow(level, 3) * 50)
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const raw = (searchParams.get('name') || '').trim()
    if (!raw) return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    const name = raw.toLowerCase()

    const ch = await fetchCharacter(name)
    const exp = ch.experience ?? estimateExpFromLevel(ch.level)
    const captured_date = new Date().toISOString().slice(0, 10)

    const { error } = await admin.from('character_xp_log').upsert(
      { name, world: ch.world, level: ch.level, experience: exp, captured_date },
      { onConflict: 'name,captured_date' }
    )
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'ingest failed' }, { status: 500 })
  }
}
