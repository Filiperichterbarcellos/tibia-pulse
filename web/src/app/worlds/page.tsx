// Server Component simples lendo direto do Tibiadata v4

type TDWorld = {
  name: string;
  online_count?: number;
  players_online?: number;
  server_location?: string;
  location?: string;
};

type TDResponse = {
  worlds?: {
    regular_worlds?: TDWorld[];
    regular?: TDWorld[];
    allworlds?: TDWorld[];
    all_worlds?: TDWorld[];
    worlds_list?: TDWorld[];
  };
};

type Row = {
  name: string;
  online: number | null;
  where: string | null;
};

function s(x: unknown): string | null {
  return typeof x === "string" && x.trim() ? x : null;
}
function n(x: unknown): number | null {
  const v = typeof x === "string" ? Number(x) : x;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export const dynamic = "force-dynamic";

export default async function WorldsPage() {
  // Lê direto do v4
  const res = await fetch("https://api.tibiadata.com/v4/worlds", {
    // não cacheia no build pra não “congelar” valor
    cache: "no-store",
  }).catch(() => null);

  let rows: Row[] = [];

  if (res && res.ok) {
    const json = (await res.json().catch(() => null)) as TDResponse | null;

    const bag: TDWorld[] = [
      ...(json?.worlds?.regular_worlds ?? []),
      ...(json?.worlds?.regular ?? []),
      ...(json?.worlds?.allworlds ?? []),
      ...(json?.worlds?.all_worlds ?? []),
      ...(json?.worlds?.worlds_list ?? []),
    ];

    const byName = new Map<string, TDWorld>();
    for (const w of bag) if (w?.name) byName.set(w.name, w);

    rows = Array.from(byName.values()).map((w) => ({
      name: w.name,
      online: n(w.online_count ?? w.players_online),
      where: s(w.server_location ?? w.location),
    }));

    rows.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Worlds (online)</h1>

      {!rows.length ? (
        <div className="border rounded p-3">Nenhum dado disponível.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Mundo</th>
                <th className="py-2 pr-3">Online</th>
                <th className="py-2 pr-3">Local</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b last:border-0">
                  <td className="py-2 pr-3">{r.name}</td>
                  <td className="py-2 pr-3">{r.online ?? "-"}</td>
                  <td className="py-2 pr-3">{r.where ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
