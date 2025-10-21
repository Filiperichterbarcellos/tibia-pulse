// web/src/app/api/ingest/route.ts (ou o caminho em que você colou esse handler)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// SUPABASE (server-only): usar SERVICE ROLE
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---- Tipos mínimos para o retorno do TibiaData v4 (somente o que usamos) ----
type TDCharacter = {
  name?: unknown;
  world?: unknown;
  level?: unknown;
  experience?: unknown;
};

type TDCharactersEnvelope = {
  characters?: {
    character?: TDCharacter;
  };
};

// helpers
function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// TODO: troque pela tua integração real (TibiaData v4)
async function fetchCharacter(name: string) {
  const url = `https://api.tibiadata.com/v4/characters/${encodeURIComponent(name)}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Upstream error: ${r.status}`);
  }

  const data = (await r.json()) as unknown as TDCharactersEnvelope;
  const c = data?.characters?.character;

  if (!c || typeof c !== "object") throw new Error("Character payload missing");
  const charName = (c as TDCharacter).name;
  if (typeof charName !== "string" || !charName) throw new Error("Character not found");

  const world = (c as TDCharacter).world;
  const level = (c as TDCharacter).level;
  const experience = (c as TDCharacter).experience;

  return {
    name: charName,
    world: typeof world === "string" ? world : "Unknown",
    level: typeof level === "number" ? level : Number(level ?? 0) || 0,
    experience: typeof experience === "number" ? experience : null,
  };
}

// fallback se a API não trouxer experience (aproximação)
function estimateExpFromLevel(level: number) {
  return Math.floor(Math.pow(level, 3) * 50);
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get("name") || "").trim();
    if (!raw) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    // normaliza para chave (se quiser manter case original no banco, salve ambos)
    const nameKey = raw.toLowerCase();

    const ch = await fetchCharacter(raw); // busca com o nome como veio
    const exp = ch.experience ?? estimateExpFromLevel(ch.level);
    const captured_date = new Date().toISOString().slice(0, 10);

    const { error } = await admin
      .from("character_xp_log")
      .upsert(
        { name: nameKey, world: ch.world, level: ch.level, experience: exp, captured_date },
        { onConflict: "name,captured_date" }
      );

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: unknown) {
    const msg = getErrorMessage(e);
    console.error("[ingest] error:", msg);
    return NextResponse.json({ error: msg || "ingest failed" }, { status: 500 });
  }
}
