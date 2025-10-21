import { NextResponse } from "next/server";
import { load } from "cheerio";
import type { Element as DomElement } from "domhandler";

export const revalidate = 60 * 60 * 6; // 6h

function toNumber(s: string): number {
  // remove espaços, pontos de milhar e converte vírgula decimal
  return Number(
    s
      .replace(/\s+/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
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
    // queremos sempre tentar pegar o mais novo; o revalidate acima cuida do cache da rota
    cache: "no-store",
  }).then((r) => {
    if (!r.ok) throw new Error(`GuildStats error: ${r.status}`);
    return r.text();
  });

  const $ = load(html);

  // pega a tabela que tem o cabeçalho "Date" (fica na aba Experience)
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

    // normaliza + e os diferentes sinais de menos que aparecem no site (−, U+2212)
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
      { series: [], best: null, averageDailyExp: 0 },
      { status: 200 }
    );
  }

  // métricas simples
  const positiveDays = series.filter((d) => d.expChange > 0);
  const best =
    positiveDays.length > 0
      ? positiveDays.reduce((acc, d) =>
          d.expChange > acc.expChange ? d : acc
        )
      : null;

  const averageDailyExp =
    positiveDays.length > 0
      ? Math.round(
          positiveDays.reduce((sum, d) => sum + d.expChange, 0) /
            Math.max(1, positiveDays.length)
        )
      : 0;

  return NextResponse.json({ series, best, averageDailyExp });
}
