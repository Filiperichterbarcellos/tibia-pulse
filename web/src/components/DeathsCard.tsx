'use client';

type Death = {
  time: string;
  level: number;
  reason?: string;
  killers?: { name?: string; player?: boolean }[];
};

export default function DeathsCard({ deaths }: { deaths?: Death[] }) {
  if (!deaths || deaths.length === 0) {
    return (
      <div className="border rounded p-4">
        <div className="font-medium mb-1">Mortes recentes</div>
        <div className="text-sm text-neutral-500">Nenhuma morte registrada.</div>
      </div>
    );
  }

  return (
    <div className="border rounded p-4">
      <div className="font-medium mb-3">Mortes recentes</div>
      <ul className="space-y-2">
        {deaths.slice(0, 10).map((d, i) => {
          const when = new Date(d.time).toLocaleString();
          const killers =
            (d.killers ?? [])
              .map(k => (k?.name ? k.name : ''))
              .filter(Boolean)
              .join(', ') || undefined;

          return (
            <li key={i} className="text-sm border-b last:border-0 pb-2">
              <div>
                <b>{when}</b> — morreu no nível <b>{d.level}</b>
              </div>
              {killers && <div>Assassinos: {killers}</div>}
              {d.reason && <div>Motivo: {d.reason}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
