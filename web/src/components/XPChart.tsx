'use client';

type ExpPoint = {
  date: string;                 // 'YYYY-MM-DD'
  experience?: number;          // total acumulado
  experience_delta?: number;    // ganho do dia
};

function formatNumber(n?: number) {
  if (n == null) return '-';
  return n.toLocaleString();
}

export default function XPStats({ points }: { points?: ExpPoint[] }) {
  const data = Array.isArray(points) ? [...points] : [];
  // ordena asc por data (garante consistência)
  data.sort((a, b) => a.date.localeCompare(b.date));

  const record = data.reduce((max, p) => {
    const v = Number(p.experience_delta ?? 0);
    return v > max ? v : max;
  }, 0);

  return (
    <div className="border rounded p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-medium">XP por dia</div>
        <div className="text-sm">
          Recorde pessoal: <b>{formatNumber(record)}</b>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-sm text-neutral-500">
          Sem histórico de experiência disponível.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Ganho (Δ)</th>
                <th className="py-2 pr-3">Experiência total</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-14).map((p, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-3">{p.date}</td>
                  <td className="py-2 pr-3">{formatNumber(p.experience_delta)}</td>
                  <td className="py-2 pr-3">{formatNumber(p.experience)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-neutral-500 mt-2">
            Mostrando os últimos {Math.min(14, data.length)} dias (se disponíveis).
          </div>
        </div>
      )}
    </div>
  );
}
