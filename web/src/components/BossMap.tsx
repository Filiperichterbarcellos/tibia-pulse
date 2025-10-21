'use client';

import { useMemo, useState } from 'react';

export type BossSpawn = {
  label?: string;
  x: number; // SQM X
  y: number; // SQM Y
  z: number; // 0..15
};

function embedUrlFor(x: number, y: number, z: number) {
  // O TibiaMaps aceita '#x,y,z' no hash para centralizar o mapa
  return `https://tibiamaps.io/map/embed#${x},${y},${z}`;
}

export default function BossMap({ spawns }: { spawns: BossSpawn[] }) {
  const [idx, setIdx] = useState(0);
  const current = spawns[Math.min(Math.max(idx, 0), spawns.length - 1)];

  const src = useMemo(
    () => embedUrlFor(current.x, current.y, current.z ?? 7),
    [current.x, current.y, current.z]
  );

  return (
    <div className="space-y-3">
      {spawns.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {spawns.map((s, i) => (
            <button
              key={`${s.x}-${s.y}-${s.z}-${i}`}
              onClick={() => setIdx(i)}
              className={[
                'px-3 py-1.5 rounded border text-sm',
                i === idx ? 'bg-orange-600 text-white border-orange-600' : 'hover:bg-neutral-50',
              ].join(' ')}
              title={`x:${s.x} y:${s.y} z:${s.z}`}
            >
              {s.label ?? `Spawn ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="relative border rounded overflow-hidden">
        {/* Altura fixa confortável; ajuste se quiser */}
        <iframe
          key={src}
          src={src}
          title="Tibia map"
          className="w-full"
          style={{ height: 460, border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute right-2 bottom-2 text-[11px] text-neutral-600 bg-white/90 rounded px-1.5 py-0.5 border">
          usando{' '}
          <a className="underline" href="https://tibiamaps.io" target="_blank" rel="noreferrer">
            TibiaMaps.io
          </a>
        </div>
      </div>
    </div>
  );
}
