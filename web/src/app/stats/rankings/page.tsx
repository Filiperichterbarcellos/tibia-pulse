// src/app/stats/rankings/page.tsx
"use client";

import { useMemo, useState } from "react";

type Row = { name: string; value: number; world?: string };

const METRICS = [
  { key: "price", title: "Preço", unit: "TC", precision: 0 },
  { key: "level", title: "Level", unit: "", precision: 0 },
  { key: "magic", title: "Magic", unit: "", precision: 2 },
  { key: "distance", title: "Distance", unit: "", precision: 2 },
  { key: "sword", title: "Sword", unit: "", precision: 2 },
  { key: "axe", title: "Axe", unit: "", precision: 2 },
  { key: "club", title: "Club", unit: "", precision: 2 },
  { key: "fist", title: "Fist", unit: "", precision: 2 },
  { key: "shielding", title: "Shielding", unit: "", precision: 2 },
  { key: "fishing", title: "Fishing", unit: "", precision: 2 },
] as const;

const WORLDS = ["Todos", "Antica", "Belobra", "Bombra", "Quelibra", "Premia"];

function fmt(n: number, precision = 0) {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

/** ------- MOCK: gere dados de exemplo para não ficar em branco -------- */
function mockRows(metricKey: string, world: string): Row[] {
  const baseNames = [
    "Rayo Legacy",
    "Drof ox",
    "Edinho Inhome",
    "Otavio Invencivel",
    "Animoza Psyhoza",
    "Nevrop",
    "Great Gems",
    "Ennyrk Godlike",
    "Talin",
    "Alattus Sagittarius",
  ];

  const valBase: Record<string, number> = {
    price: 900_000,
    level: 2200,
    magic: 140,
    distance: 140,
    sword: 140,
    axe: 140,
    club: 140,
    fist: 120,
    shielding: 130,
    fishing: 100,
  };

  const spread: Record<string, number> = {
    price: 250_000,
    level: 600,
    magic: 12,
    distance: 12,
    sword: 12,
    axe: 12,
    club: 12,
    fist: 12,
    shielding: 8,
    fishing: 12,
  };

  const rows: Row[] = baseNames.map((name, idx) => {
    const jitter =
      (Math.sin(idx * 1.37 + metricKey.length) + 1) / 2; // 0..1
    let value = valBase[metricKey] + jitter * spread[metricKey];

    // valores mais plausíveis:
    if (metricKey === "price") value = Math.round(value / 1000) * 1000;
    if (metricKey === "level") value = Math.round(value);
    if (["magic", "distance", "sword", "axe", "club", "fist", "shielding", "fishing"].includes(metricKey)) {
      value = Math.round(value * 100) / 100;
    }

    return { name, value, world: world === "Todos" ? WORLDS[(idx % (WORLDS.length - 1)) + 1] : world };
  });

  // ordena desc
  rows.sort((a, b) => b.value - a.value);
  return rows.slice(0, 10);
}

/** -------- Card de ranking (tabela) -------- */
function RankCard({
  title,
  unit,
  precision,
  rows,
}: {
  title: string;
  unit: string;
  precision: number;
  rows: Row[];
}) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-black/5 shadow-sm">
      <div className="border-b px-4 py-2.5">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="px-4 py-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-neutral-500">
              <th className="w-10 py-1 text-left">#</th>
              <th className="py-1 text-left">Nickname</th>
              <th className="py-1 text-right">▲ {unit ? unit : title}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} className="border-t">
                <td className="py-1.5 text-neutral-500">{i + 1}</td>
                <td className="py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.name}</span>
                    {r.world && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">
                        {r.world}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-1.5 text-right font-medium">
                  {unit === "TC"
                    ? `${fmt(r.value, precision)} ${unit}`
                    : fmt(r.value, precision)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** -------- Página -------- */
export default function RankingsPage() {
  const [world, setWorld] = useState<string>("Todos");

  // TODO (API real):
  // Substituir mockRows() por fetch:
  // const rowsByMetric = await fetch(`/api/stats/rankings?world=${world}`)
  //  -> { level: Row[], magic: Row[], ... }
  const rowsByMetric = useMemo(() => {
    const map: Record<string, Row[]> = {};
    METRICS.forEach((m) => (map[m.key] = mockRows(m.key, world)));
    return map;
  }, [world]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      {/* Filtros simples */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Rankings</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">World:</label>
          <select
            value={world}
            onChange={(e) => setWorld(e.target.value)}
            className="rounded-md border px-2.5 py-1.5 text-sm"
          >
            {WORLDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {METRICS.map((m) => (
          <RankCard
            key={m.key}
            title={`Top 10 ${m.title}`}
            unit={m.unit}
            precision={m.precision}
            rows={rowsByMetric[m.key]}
          />
        ))}
      </div>
    </main>
  );
}
