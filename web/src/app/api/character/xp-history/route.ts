// web/src/app/api/character/xp-history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseRead } from "@/lib/supabaseRead";

type CharacterXpHistory = {
  date: string; // "YYYY-MM-DD"
  xp: number;
};

type RpcArgs = { p_name: string; p_days: number };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name")?.trim();
    const days = Number(searchParams.get("days") ?? "14");

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const sb = supabaseRead();

    // Sem genérico aqui, depois tipamos o resultado de forma segura
    const rpcRes = await sb.rpc("get_character_xp_history", {
      p_name: name,
      p_days: days,
    } as RpcArgs);

    if (rpcRes.error) {
      // eslint-disable-next-line no-console
      console.error("xp-history rpc error", rpcRes.error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // Normaliza para array tipado
    const rows: CharacterXpHistory[] = Array.isArray(rpcRes.data)
      ? (rpcRes.data as unknown[]).map((r) => {
          // Narrowing básico para garantir o shape
          const o = r as Record<string, unknown>;
          return {
            date: String(o.date ?? ""),
            xp: Number(o.xp ?? 0),
          };
        })
      : [];

    // Ordena ASC por data
    const history = rows.slice().sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ name, days, history });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("xp-history route error", e);
    return NextResponse.json({ error: "Unhandled error" }, { status: 500 });
  }
}
