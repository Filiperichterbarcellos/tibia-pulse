import { NextRequest } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs"; // garante ambiente Node no Next

function num(s: string) {
  return Number(s.replace(/[^\d]/g, "")) || 0;
}

/**
 * GET /api/highscores/xp?world=Antica&page=1
 * Scrape dos highscores de experiência diretamente do tibia.com
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const world = searchParams.get("world") ?? "Antica";
  const page = Number(searchParams.get("page") ?? "1");

  const url =
    `https://www.tibia.com/community/?subtopic=highscores` +
    `&world=${encodeURIComponent(world)}` +
    `&profession=0` +                 // 0 = all vocations
    `&category=experience` +          // experiência
    `&page=${page}`;

  const upstream = await fetch(url, {
    headers: {
      // ajuda a evitar bloqueio simples por user-agent
      "user-agent":
        process.env.SCRAPER_UA ||
        "Mozilla/5.0 (compatible; TibiaPulseBot/1.0; +https://tibiapulse.example)",
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return Response.json(
      { error: "upstream_error", status: upstream.status },
      { status: 502 },
    );
  }

  const html = await upstream.text();
  const $ = cheerio.load(html);

  // A tabela de highscores do tibia.com é uma TableContent.
  // Vamos coletar linhas que tenham 5 colunas (rank, name, vocation, level, points)
  const rows: Array<{
    rank: number;
    name: string;
    vocation: string;
    level: number;
    points: number;
  }> = [];

  $("table.TableContent tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length >= 5) {
      const rank = num($(tds[0]).text());
      const name = $(tds[1]).text().trim();
      const vocation = $(tds[2]).text().trim();
      const level = num($(tds[3]).text());
      const points = num($(tds[4]).text());

      if (rank && name) {
        rows.push({ rank, name, vocation, level, points });
      }
    }
  });

  return Response.json({ world, page, results: rows });
}
