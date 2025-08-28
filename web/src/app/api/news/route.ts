import { NextResponse } from "next/server";

const TIBIA_NEWS_RSS =
  "https://www.tibia.com/news/?subtopic=latestnews&channel=rss";

export const revalidate = 3600; // 1h
export const dynamic = "force-static";

function stripHtml(x: string) {
  return x.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function GET() {
  try {
    const res = await fetch(TIBIA_NEWS_RSS, { cache: "force-cache" });
    if (!res.ok) {
      return NextResponse.json({ error: "fetch failed" }, { status: 502 });
    }
    const xml = await res.text();

    // pega até 6 items
    const rawItems = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    const items = rawItems.slice(0, 6).map((raw) => {
      const get = (tag: string) =>
        (raw.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? "").trim();

      return {
        title: stripHtml(get("title")),
        link: stripHtml(get("link")),
        pubDate: stripHtml(get("pubDate")),
        description: stripHtml(get("description")).slice(0, 240),
      };
    });

    return NextResponse.json(items);
  } catch (e) {
    console.error("news error", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
