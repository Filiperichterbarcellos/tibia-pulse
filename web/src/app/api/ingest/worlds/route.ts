import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic" as const;

const TIBIADATA_WORLDS = "https://api.tibiadata.com/v4/worlds";

/** Ajuste para bater 1:1 com as colunas da sua tabela `worlds` */
type WorldRow = {
  name: string;
  pvp_type: string | null;
  location: string | null;
  online_count: number | null;
  players_online: number | null;
  server_location: string | null;
  worldid: string | null;
  // updated_at?: string; // descomente se existir
};

type TibiadataWorld = {
  name: string;
  pvp_type?: string;
  location?: string;
  online_count?: number;
  players_online?: number;
  server_location?: string;
  worldid?: string | number;
};

type TibiadataResponse = {
  worlds?: {
    regular_worlds?: TibiadataWorld[];
    regular?: TibiadataWorld[];
    allworlds?: TibiadataWorld[];
    all_worlds?: TibiadataWorld[];
    worlds_list?: TibiadataWorld[];
  };
};

function s(x: unknown): string | null {
  return typeof x === "string" && x.trim() ? x : null;
}
function n(x: unknown): number | null {
  const v = typeof x === "string" ? Number(x) : x;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function GET() {
  try {
    const res = await fetch(TIBIADATA_WORLDS, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "tibiadata worlds failed" },
        { status: 502 }
      );
    }
    const json = (await res.json()) as TibiadataResponse;

    const bag: TibiadataWorld[] = [
      ...(json.worlds?.regular_worlds ?? []),
      ...(json.worlds?.regular ?? []),
      ...(json.worlds?.allworlds ?? []),
      ...(json.worlds?.all_worlds ?? []),
      ...(json.worlds?.worlds_list ?? []),
    ];

    const byName = new Map<string, TibiadataWorld>();
    for (const w of bag) if (w?.name) byName.set(w.name, w);

    const rows: WorldRow[] = Array.from(byName.values()).map((w) => ({
      name: w.name,
      pvp_type: s(w.pvp_type),
      location: s(w.location ?? w.server_location),
      online_count: n(w.online_count),
      players_online: n(w.players_online),
      server_location: s(w.server_location ?? w.location),
      worldid:
        s(typeof w.worldid === "number" ? String(w.worldid) : w.worldid) ?? null,
    }));

    const sb = supabaseAdmin();

    // Workaround sem `any` para client sem Database types
    const { error } = await sb
      .from("worlds")
      .upsert(rows as unknown as never[], {
        onConflict: "name", // troque para 'worldid' se essa for a unique
        ignoreDuplicates: false,
      });

    if (error) {
      // eslint-disable-next-line no-console
      console.error("upsert worlds error", error);
      return NextResponse.json({ error: "db upsert failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("ingest/worlds fatal", e);
    return NextResponse.json({ error: "unhandled error" }, { status: 500 });
  }
}
