// src/app/api/character/route.ts
import { NextRequest, NextResponse } from "next/server";

type CharacterLike = { name?: string } & Record<string, unknown>;
type ExpPointLike = {
  date?: string;
  experience?: number | null;
  experience_delta?: number | null;
} & Record<string, unknown>;

type Payload = {
  character: CharacterLike | null;
  deaths: Record<string, unknown>[];
  experience_history: ExpPointLike[];
  information: Record<string, unknown>;
};

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asArr<T = Record<string, unknown>>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/** Extrai o payload independente do shape vindo do TibiaData (v3/v4) */
function extractPayload(data: unknown): Payload {
  const d = isObj(data) ? (data as Record<string, unknown>) : ({} as Record<string, unknown>);

  const characters = isObj(d.characters) ? (d.characters as Record<string, unknown>) : undefined;
  const dCharacter = isObj(d.character) ? (d.character as Record<string, unknown>) : undefined;

  // character pode estar em: characters.character OU character.character OU character
  let characterNode: CharacterLike | null = null;
  if (characters && isObj(characters.character)) {
    characterNode = characters.character as CharacterLike;
  } else if (dCharacter && isObj(dCharacter.character)) {
    characterNode = dCharacter.character as CharacterLike;
  } else if (dCharacter) {
    characterNode = dCharacter as CharacterLike;
  } else if (isObj(d.character)) {
    characterNode = d.character as CharacterLike;
  }

  // deaths pode estar em: characters.deaths OU character.deaths OU deaths
  const deathsNode =
    (characters && asArr<Record<string, unknown>>(characters.deaths)) ||
    (dCharacter && asArr<Record<string, unknown>>(dCharacter.deaths)) ||
    asArr<Record<string, unknown>>(d.deaths);

  // experience_history pode estar em: characters.experience_history OU character.experience_history OU experience_history
  const expNode =
    (characters && asArr<ExpPointLike>(characters.experience_history)) ||
    (dCharacter && asArr<ExpPointLike>(dCharacter.experience_history)) ||
    asArr<ExpPointLike>(d.experience_history);

  const information = isObj(d.information)
    ? (d.information as Record<string, unknown>)
    : ({} as Record<string, unknown>);

  return {
    character: characterNode,
    deaths: deathsNode,
    experience_history: expNode,
    information,
  };
}

async function fetchJson(url: string): Promise<{ status: number; json: unknown }> {
  const r = await fetch(url, { cache: "no-store" });
  const json = await r.json().catch(() => null);
  return { status: r.status, json };
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get("name") || "").trim();
    const debug = searchParams.get("debug") === "1";

    if (!raw) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const name = raw; // não forçamos lower; TibiaData aceita

    const urls = [
      `https://api.tibiadata.com/v4/characters/${encodeURIComponent(name)}`,
      `https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`,
      `https://api.tibiadata.com/v3/character/${encodeURIComponent(name)}`,
    ];

    let last: { status: number; json: unknown } | null = null;
    let found: Payload | null = null;
    let usedUrl = "";

    for (const u of urls) {
      const r = await fetchJson(u);
      last = r;
      const payload = extractPayload(r.json);
      if (payload.character?.name && typeof payload.character.name === "string") {
        found = payload;
        usedUrl = u;
        break;
      }
    }

    if (debug) {
      return NextResponse.json({
        debug: true,
        tried: urls,
        usedUrl,
        lastStatus: last?.status,
        lastJson: last?.json,
      });
    }

    if (!found?.character?.name) {
      console.warn("[character] not found", {
        name,
        lastStatus: last?.status,
        sample: (() => {
          try {
            return JSON.stringify(last?.json)?.slice(0, 400);
          } catch {
            return String(last?.json);
          }
        })(),
      });
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
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
      { status: 200 }
    );
  } catch (e: unknown) {
    const msg = getErrorMessage(e);
    console.error("[character] error:", msg);
    return NextResponse.json({ error: msg || "Internal error" }, { status: 500 });
  }
}
