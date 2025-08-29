// src/app/api/character/route.ts
import { NextRequest, NextResponse } from 'next/server'

type TD = any

function extractPayload(data: TD) {
  const character =
    data?.characters?.character ??
    data?.character?.character ??
    data?.character ??
    null

  const deaths =
    data?.characters?.deaths ??
    data?.character?.deaths ??
    data?.deaths ??
    []

  const experience_history =
    data?.characters?.experience_history ??
    data?.character?.experience_history ??
    data?.experience_history ??
    []

  const information = data?.information ?? {}

  return { character, deaths, experience_history, information }
}

async function fetchJson(url: string) {
  const r = await fetch(url, { cache: 'no-store' })
  const json = await r.json().catch(() => null)
  return { status: r.status, json }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const raw = (searchParams.get('name') || '').trim()
    const debug = searchParams.get('debug') === '1'
    if (!raw) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    }

    const name = raw // não forço lowercase; TibiaData lida bem

    const urls = [
      `https://api.tibiadata.com/v4/characters/${encodeURIComponent(name)}`,
      `https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`,
      `https://api.tibiadata.com/v3/character/${encodeURIComponent(name)}`,
    ]

    let last: { status: number; json: TD } | null = null
    let found: ReturnType<typeof extractPayload> | null = null
    let usedUrl = ''

    for (const u of urls) {
      const r = await fetchJson(u)
      last = r
      const payload = extractPayload(r.json)
      if (payload.character?.name) {
        found = payload
        usedUrl = u
        break
      }
    }

    if (debug) {
      return NextResponse.json({
        debug: true,
        tried: urls,
        usedUrl,
        lastStatus: last?.status,
        lastJson: last?.json,
      })
    }

    if (!found?.character?.name) {
      console.warn(
        '[character] not found',
        { name, lastStatus: last?.status,
          sample: JSON.stringify(last?.json)?.slice(0, 400) }
      )
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        character: {
          character: found.character,
          deaths: found.deaths,
          experience_history: found.experience_history,
        },
        information: found.information,
        status: { http_code: 200 },
        _source: usedUrl,
      },
      { status: 200 },
    )
  } catch (e: any) {
    console.error('[character] error:', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
