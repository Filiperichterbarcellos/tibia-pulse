// src/app/bosses/page.tsx
'use client';

import { useMemo, useState } from 'react';
import BossMap from '@/components/BossMap';
import BossCard from '@/components/BossCard';
import { BOSSES, type Boss, type Rarity } from '@/data/bosses';

const RARITIES: ('' | Rarity)[] = ['', 'common', 'rare', 'very-rare'];

export default function BossesPage() {
  const [q, setQ] = useState('');
  const [rarity, setRarity] = useState<'' | Rarity>('');
  const [active, setActive] = useState<Boss | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return BOSSES.filter((b) => {
      const okQ = !term || b.name.toLowerCase().includes(term);
      const okR = !rarity || b.rarity === rarity;
      return okQ && okR;
    });
  }, [q, rarity]);

  // Seleciona automaticamente o primeiro quando não há ativo
  const list = filtered.length ? filtered : BOSSES;
  const selected = active ?? list[0] ?? null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Bosses</h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Sidebar */}
        <aside className="md:col-span-4 lg:col-span-4 border rounded p-3">
          {/* Busca */}
          <input
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="Buscar boss..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-3">
            {RARITIES.map((r) => (
              <button
                key={r || 'all'}
                onClick={() => setRarity(r)}
                className={[
                  'px-3 py-1.5 rounded border whitespace-nowrap min-w-[84px] text-sm',
                  rarity === r
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'hover:bg-neutral-50',
                ].join(' ')}
              >
                {r ? r : 'Todos'}
              </button>
            ))}
          </div>

          {/* Grid de cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2 max-h-[70vh] overflow-auto pr-1">
            {filtered.map((b) => (
              <BossCard
                key={b.id}
                boss={b}
                active={selected?.id === b.id}
                onClick={() => setActive(b)}
              />
            ))}
            {/* fallback se filtro ficar vazio */}
            {!filtered.length && (
              <div className="text-sm text-neutral-500">
                Nenhum boss encontrado para esse filtro.
              </div>
            )}
          </div>
        </aside>

        {/* Painel de detalhes */}
        <main className="md:col-span-8 lg:col-span-8">
          {!selected ? (
            <div className="border rounded p-6 text-neutral-600">
              Selecione um boss para ver o mapa de spawns.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold">{selected.name}</div>
                  <div className="text-sm text-neutral-500 capitalize">
                    {selected.rarity}
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="px-3 py-1.5 border rounded hover:bg-neutral-50"
                >
                  Fechar
                </button>
              </div>

              <BossMap spawns={selected.spawns} />

              {selected.notes && (
                <div className="border rounded p-3 text-sm">
                  <b>Notas: </b>
                  {selected.notes}
                </div>
              )}

              <div className="border rounded p-3 text-sm">
                <div className="font-medium mb-1">Spawns cadastrados</div>
                <ul className="list-disc pl-5 space-y-1">
                  {selected.spawns.map((s, i) => (
                    <li key={`${s.x}-${s.y}-${s.z}-${i}`}>
                      {s.label ?? 'Spawn'} — x:{s.x} y:{s.y} z:{s.z}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
