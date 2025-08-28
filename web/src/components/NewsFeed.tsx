// src/components/NewsFeed.tsx
const TIBIA_NEWS_RSS =
  "https://www.tibia.com/news/?subtopic=latestnews&channel=rss";

function stripHtml(x: string) {
  return x.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function getNews() {
  const res = await fetch(TIBIA_NEWS_RSS, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const xml = await res.text();
  const rawItems = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return rawItems.slice(0, 6).map((raw) => {
    const get = (tag: string) =>
      (raw.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? "").trim();

    return {
      title: stripHtml(get("title")),
      link: stripHtml(get("link")),
      pubDate: stripHtml(get("pubDate")),
      description: stripHtml(get("description")).slice(0, 240),
    };
  });
}

export default async function NewsFeed() {
  const items = await getNews();
  if (!items.length) return null;
  return (
    <div className="space-y-3">
      {items.map((n, i) => (
        <a key={i} href={n.link} target="_blank" className="block rounded-lg border p-3 hover:bg-neutral-50">
          <div className="text-sm text-neutral-500">{n.pubDate}</div>
          <div className="font-medium">{n.title}</div>
          {n.description ? <div className="text-sm text-neutral-600 line-clamp-2">{n.description}</div> : null}
        </a>
      ))}
    </div>
  );
}
