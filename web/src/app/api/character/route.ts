import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const v4Url = (name: string) =>
  `https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`;
const v3Url = (name: string) =>
  `https://api.tibiadata.com/v3/character/${encodeURIComponent(name)}`;

// Converte strings "123,456,789" => 123456789
function toNum(n: any): number | null {
  if (n === null || n === undefined) return null;
  const x = typeof n === 'string' ? parseInt(n.replace(/[^\d-]/g, ''), 10) : Number(n);
  return Number.isFinite(x) ? x : null;
}

function pickXP(obj: any): number | null {
  if (!obj) return null;
  const c = obj?.character?.character ?? obj?.character ?? obj;
  return (
    toNum(c?.experience_points) ??
    toNum(c?.experience) ??
    toNum(obj?.experience_points) ??
    toNum(obj?.experience) ??
    null
  );
}

// Fallback: raspa o HTML oficial do tibia.com e extrai "Experience Points"
async function fetchXPFromTibiaDotCom(name: string): Promise<number | null> {
  try {
    const url = `https://www.tibia.com/community/?name=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        // Evita algum bloqueio bobo
        'User-Agent':
          'Mozilla/5.0 (compatible; TibiaPulseBot/1.0; +https://example.com)',
        'Accept-Language': 'en-US,en;q=0.9', // força inglês (texto "Experience Points")
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Padrões comuns no HTML (tabela de informações)
    // Ex: "<td>Experience Points:</td><td>123,456,789</td>"
    const m =
      html.match(/Experience\s*Points:\s*<\/td>\s*<td[^>]*>([\d.,]+)/i) ||
      html.match(/Pontos\s*de\s*Experi[êe]ncia:\s*<\/td>\s*<td[^>]*>([\d.,]+)/i); // PT fallback

    if (!m || !m[1]) return null;
    return toNum(m[1]);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Missing character name' }, { status: 400 });
  }

  try {
    // Busca paralela: v4 e v3
    const [v4Settled, v3Settled] = await Promise.allSettled([
      fetch(v4Url(name), { cache: 'no-store' }),
      fetch(v3Url(name), { cache: 'no-store' }),
    ]);

    const read = async (s: PromiseSettledResult<Response>) => {
      if (s.status !== 'fulfilled') return { ok: false, status: 0, json: null as any };
      const res = s.value;
      const text = await res.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}
      return { ok: res.ok, status: res.status, json };
    };

    const v4 = await read(v4Settled);
    const v3 = await read(v3Settled);

    if (!v4.ok && !v3.ok) {
      const status = v4.status || v3.status || 404;
      return NextResponse.json({ error: 'Character not found' }, { status });
    }

    // Base do payload (formato v4): preferir v4 se ok, senão v3
    const base = v4.ok ? v4.json : v3.json;
    const payload: any = base ?? {};
    if (!payload.character) payload.character = {};
    if (!payload.character.character) payload.character.character = {};

    // 1) XP da API (v4/v3)
    let xpFinal = pickXP(v4.json) ?? pickXP(v3.json);

    // 2) Fallback: tibia.com HTML
    if (xpFinal == null) {
      xpFinal = await fetchXPFromTibiaDotCom(name);
      if (xpFinal != null) {
        payload.__xp_source = 'tibia.com';
      }
    } else {
      payload.__xp_source = v4.ok ? 'tibiadata_v4' : 'tibiadata_v3';
    }

    if (xpFinal != null) {
      payload.character.character.experience_points = xpFinal;
    }

    // Pequeno bloco de debug opcional
    payload.__sources = {
      v4_status: v4.status || null,
      v3_status: v3.status || null,
      xp_from_v4: pickXP(v4.json),
      xp_from_v3: pickXP(v3.json),
      xp_from_tibia: payload.__xp_source === 'tibia.com' ? xpFinal : null,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error('character route fatal', err);
    return NextResponse.json({ error: 'Failed to fetch character' }, { status: 500 });
  }
}
