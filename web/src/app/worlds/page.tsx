// src/app/worlds/page.tsx
// Server Component

type WorldRow = {
  world_name: string;            // ex.: "Antica"
  online_count: number | null;   // total online na coleta
  captured_at: string | null;    // ISO datetime
};

type LatestInfo = { online: number | null; at: string };
type LatestEntry = [string, LatestInfo];

function toWorldRow(x: unknown): WorldRow | null {
  if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;

    const name =
      typeof o.world_name === "string"
        ? o.world_name
        : typeof o.name === "string"
        ? o.name
        : undefined;

    const online =
      typeof o.online_count === "number"
        ? o.online_count
        : typeof o.players_online === "number"
        ? o.players_online
        : typeof o.online === "number"
        ? o.online
        : null;

    const at =
      typeof o.captured_at === "string"
        ? o.captured_at
        : typeof o.updated_at === "string"
        ? o.updated_at
        : typeof o.at === "string"
        ? o.at
        : null;

    if (name) {
      return { world_name: name, online_count: online, captured_at: at };
    }
  }
  return null;
}

function pickArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as unknown[];
    if (Array.isArray(o.rows)) return o.rows as unknown[];
  }
  return [];
}

export default async function WorldsPage() {
  // Ajuste a origem de dados se necessário
  const res = await fetch(
    process.env.NEXT_PUBLIC_WORLDS_ENDPOINT ?? "/api/worlds-history",
    { cache: "no-store" }
  ).catch(() => null);

  let rows: WorldRow[] = [];

  if (res && res.ok) {
    const json: unknown = await res.json().catch(() => null);
    rows = pickArray(json)
      .map(toWorldRow)
      .filter((r): r is WorldRow => r !== null);
  }

  // Mais recente por mundo
  const latest = new Map<string, LatestInfo>();
  rows.forEach((r: WorldRow) => {
    if (!latest.has(r.world_name)) {
      latest.set(r.world_name, {
        online: r.online_count,
        at: r.captured_at ? new Date(r.captured_at).toLocaleString() : "-",
      });
    }
  });

  const list: LatestEntry[] = Array.from(latest.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Worlds (online)</h1>

      {!list.length ? (
        <div className="border rounded p-3">Nenhum dado disponível.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Mundo</th>
                <th className="py-2 pr-3">Online</th>
                <th className="py-2 pr-3">Coletado em</th>
              </tr>
            </thead>
            <tbody>
              {list.map(([name, info]) => (
                <tr key={name} className="border-b last:border-0">
                  <td className="py-2 pr-3">{name}</td>
                  <td className="py-2 pr-3">{info.online ?? "-"}</td>
                  <td className="py-2 pr-3">{info.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
