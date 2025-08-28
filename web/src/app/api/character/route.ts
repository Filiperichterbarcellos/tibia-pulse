import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic" as const;

const v4Url = (name: string) =>
  `https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`;
const v3Url = (name: string) =>
  `https://api.tibiadata.com/v3/character/${encodeURIComponent(name)}`;

/** ------ Helpers de narrowing ------ */

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function toNum(n: unknown): number | null {
  if (n === null || n === undefined) return null;
  if (typeof n === "number" && Number.isFinite(n)) return n;
  if (typeof n === "string") {
    const x = parseInt(n.replace(/[^\d-]/g, ""), 10);
    return Number.isFinite(x) ? x : null;
  }
  return null;
}

/**
 * Tenta extrair XP em diversos formatos comuns das respostas v3/v4:
 * - obj.character.character.experience_points
 * - obj.character.experience_points
 * - obj.experience_points
 * - (variações com "experience")
 */
function pickXP(obj: unknown): number | null {
  if (!isRecord(obj)) return null;

  const c1 = isRecord(obj.character) ? obj.character : undefined;
  const c2 =
    c1 && isRecord(c1.character) ? (c1.character as Record<string, unknown>) : undefined;

  return (
    toNum(c2?.experience_points) ??
    toNum(c2?.experience) ??
    toNum(c1?.experience_points) ??
    toNum(c1?.experience) ??
    toNum(obj.experience_points) ??
    toNum(obj.experience) ??
    null
  );
}

/**
 * Garante a presença dos nós payload.character e payload.character.character,
 * retornando uma referência mutável segura para setar `experience_points`.
 */
function ensureCharacterCharacterNode(
  base: unknown
): { payload: Record<string, unknown>; node: Record<string, unknown> } {
  const payload: Record<string, unknown> = isRecord(base) ? base : {};
  if (!isRecord(payload.character)) payload.character = {};
  const character = payload.character as Record<string, unknown>;
  if (!isRecord(character.character)) character.character = {};
  const node = character.character as Record<string, unknown>;
  return { payload, node };
}

/** ------ Fallback: raspagem do tibia.com ------ */
async function fetchXPFromTibiaDotCom(name: string): Promise<number | null> {
  try {
    const url = `https://www.tibia.com/community/?name=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TibiaPulseBot/1.0; +https://example.com)",
        "Accept-Language": "en-US,en;q=0.9", // força inglês para "Experience Points"
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const m =
      html.match(/Experience\s*Points:\s*<\/td>\s*<td[^>]*>([\d.,]+)/i) ||
      html.match(
        /Pontos\s*de\s*Experi[êe]ncia:\s*<\/td>\s*<td[^>]*>([\d.,]+)/i
      ); // fallback PT

    if (!m || !m[1]) return null;
    return toNum(m[1]);
  } catch {
    return null;
  }
}

/** ------ Utilitário para ler Promises "settled" de fetch ------ */
type ReadResult = { ok: boolean; status: number; json: unknown };

async function readSettledResponse(
  s: PromiseSettledResult<Response>
): Promise<ReadResult> {
  if (s.status !== "fulfilled") {
    return { ok: false, status: 0, json: null };
  }
  const res = s.value;
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
}

/** ------ Handler ------ */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Missing character name" },
      { status: 400 }
    );
  }

  try {
    // Busca paralela em v4 e v3
    const [v4Settled, v3Settled] = await Promise.allSettled([
      fetch(v4Url(name), { cache: "no-store" }),
      fetch(v3Url(name), { cache: "no-store" }),
    ]);

    const v4 = await readSettledResponse(v4Settled);
    const v3 = await readSettledResponse(v3Settled);

    if (!v4.ok && !v3.ok) {
      const status = v4.status || v3.status || 404;
      return NextResponse.json({ error: "Character not found" }, { status });
    }

    // Prefira base v4 se disponível; senão v3
    const base = v4.ok ? v4.json : v3.json;

    // 1) XP da API (v4/v3)
    let xpFinal = pickXP(v4.json) ?? pickXP(v3.json);

    // 2) Fallback: tibia.com HTML
    let xpSource: "tibiadata_v4" | "tibiadata_v3" | "tibia.com" | undefined;
    if (xpFinal == null) {
      xpFinal = await fetchXPFromTibiaDotCom(name);
      if (xpFinal != null) xpSource = "tibia.com";
    } else {
      xpSource = v4.ok ? "tibiadata_v4" : "tibiadata_v3";
    }

    // Monta payload assegurando o caminho character.character
    const { payload, node } = ensureCharacterCharacterNode(base);

    if (xpFinal != null) {
      node.experience_points = xpFinal;
    }

    // Bloco de debug opcional (mantém o que você já tinha)
    (payload as Record<string, unknown>).__xp_source = xpSource;
    (payload as Record<string, unknown>).__sources = {
      v4_status: v4.status || null,
      v3_status: v3.status || null,
      xp_from_v4: pickXP(v4.json),
      xp_from_v3: pickXP(v3.json),
      xp_from_tibia: xpSource === "tibia.com" ? xpFinal : null,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("character route fatal", err);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}
