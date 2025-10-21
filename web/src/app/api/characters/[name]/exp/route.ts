// src/app/api/characters/[name]/exp/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";
import type { Element as DomElement } from "domhandler";

// IMPORTANTE: use runtime Node.js (cheerio não roda no Edge)
export const runtime = "nodejs";
// revalidate precisa ser literal
export const revalidate = 21600; // 6h

function toNumber(s: string): number {
  // remove espaços, pontos de milhar e converte vírgula decimal
  return Number(
    s.replace(/\s+/g, "").replace(/\./g, "").replace(",", ".")
  );
}

type Row = {
  date: string;
  expChange: number;
  level: number | null;
  avgPerHour: number | null;
};

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const name = decodeURIComponent(params.name || "");
  if (!name) {
    return NextResponse.json({ error: "missing name" }, { status: 400 });
  }

  const url = `https://guildstats.eu/character?nick=${encodeURIComponent(
    name
  )}&tab=9`;

  const html = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) TibiaPulse/1.0 Safari/605.1.15",
      Accept: "text/html",
    },
    // sempre buscar fresco; o cache desta rota é controlado por `revalidate`
    cache: "no-store",
  }).then((r) => {
    if (!r.ok) throw new Error(`GuildStats error: ${r.status}`);
    return r.text();
  });

  const $ = load(html);

  // pega a tabela que tem o cabeçalho "Date" (aba Experience)
  const expTable = $("table")
    .filter((_, el) =>
      $(el).find("th").first().text().toLowerCase().includes("date")
    )
    .last();

  const rowsSel = expTable.find("tr").slice(1); // pula o cabeçalho

  const series: Row[] = [];

  rowsSel.each((_: number, tr: DomElement) => {
    const tds = $(tr).find("td");
    if (tds.length < 2) return;

    const date = $(tds[0]).text().trim();
    const expChangeRaw = $(tds[1]).text().trim();
    const lvlText = tds.length > 3 ? $(tds[3]).text().trim() : "";
    const avgHourText = tds.length > 6 ? $(tds[6]).text().trim() : "";

    // normaliza + e diferentes sinais de menos (−, U+2212)
    const expChange = toNumber(
      expChangeRaw.replace("+", "").replace(/\u2212|−/g, "-")
    );

    let level: number | null = null;
    if (lvlText) {
      const m = lvlText.match(/\d+/);
      level = m ? parseInt(m[0], 10) : null;
    }

    const avgPerHour =
      avgHourText && /\d/.test(avgHourText) ? toNumber(avgHourText) : null;

    if (!Number.isNaN(expChange)) {
      series.push({ date, expChange, level, avgPerHour });
    }
  });

  if (!series.length) {
    return NextResponse.json(
      {
        // novo formato
        days: [],
        average: 0,
        best: null,
        // legado
        series: [],
        averageDailyExp: 0,
        bestRow: null,
      },
      { status: 200 }
    );
  }

  // métricas simples
  const positiveDays = series.filter((d) => d.expChange > 0);
  const bestRow =
    positiveDays.length > 0
      ? positiveDays.reduce((acc, d) => (d.expChange > acc.expChange ? d : acc))
      : null;

  const averageDailyExp =
    positiveDays.length > 0
      ? Math.round(
          positiveDays.reduce((sum, d) => sum + d.expChange, 0) /
            Math.max(1, positiveDays.length)
        )
      : 0;

  // resposta compatível com ambos os consumidores
  return NextResponse.json(
    {
      // novo formato (usado pelo client atual)
      days: series.map((s) => ({ date: s.date, gain: s.expChange })),
      average: averageDailyExp,
      best: bestRow ? bestRow.expChange : null,
      // formato legado (se algo ainda ler isso)
      series,
      averageDailyExp,
      bestRow,
    },
    { status: 200 }
  );
}
