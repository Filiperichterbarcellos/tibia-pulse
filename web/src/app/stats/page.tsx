'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/* =========================
 * Tipagens
 * =======================*/
type Snapshot = { captured_at: string; online_count: number };
type VRow = { vocation: string; count: number };

/* =========================
 * Paleta vocações
 * =======================*/
const VOCATION_COLORS: Record<string, string> = {
  Knight: '#10b981', // emerald
  Paladin: '#f59e0b', // amber
  Sorcerer: '#6366f1', // indigo
  Druid: '#22c55e', // green
  Monk: '#a855f7', // opcional (se existir)
};

/* =========================
 * Helpers de formatação
 * =======================*/
const fmt = (n: number) => n.toLocaleString('pt-BR');

const fmtEURc = (n: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);

const fmtTCc = (n: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n) + ' TC';

/* =========================
 * Tooltip bonitinha
 * =======================*/
function PrettyTooltip({ active, label, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-sm text-xs">
      <div className="mb-1 font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ background: p.color }}
        />
        <span className="text-neutral-600">{p.name}:</span>
        <span className="font-semibold">{p.value}</span>
      </div>
    </div>
  );
}

/* =========================
 * Card de área reutilizável (Economia)
 * =======================*/
function AreaCard({
  title,
  days,
  setDays,
  data,
  color,
  yTickFmt,
  valueFmt,
}: {
  title: string;
  days: 7 | 28;
  setDays: (d: 7 | 28) => void;
  data: { captured_at: string; value: number }[];
  color: string; // ex: "#10b981"
  yTickFmt: (n: number) => string;
  valueFmt: (n: number) => string;
}) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-black/5 shadow-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDays(7)}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              days === 7
                ? 'bg-amber-600 text-white border-amber-600'
                : 'hover:bg-neutral-50'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setDays(28)}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              days === 28
                ? 'bg-amber-600 text-white border-amber-600'
                : 'hover:bg-neutral-50'
            }`}
          >
            28 dias
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 10, left: 6, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e9ecef" />
            <XAxis
              dataKey="captured_at"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickMargin={8}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={70}
              tickFormatter={yTickFmt}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <RTooltip
              content={<PrettyTooltip />}
              formatter={(v: any) => valueFmt(Number(v))}
              labelFormatter={(l) => l}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#grad-${title})`}
              dot={false}
              activeDot={{ r: 3 }}
              name={title}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* =========================
 * Mock de série (fallback)
 * =======================*/
function mockOnline(days: 7 | 28): Snapshot[] {
  const total = days === 7 ? 7 * 24 : 28 * 24;
  const base = Date.now() - total * 3600_000;
  const out: Snapshot[] = [];
  for (let i = 0; i < total; i++) {
    const t = base + i * 3600_000;
    const v =
      120 +
      Math.round(60 * Math.sin(i / 6)) + // ciclo ~24h
      Math.round(10 * Math.sin(i / 2)); // ruído curto
    out.push({
      captured_at: new Date(t).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
      }),
      online_count: Math.max(30, v),
    });
  }
  return out;
}

/* =========================
 * Mini card de métrica
 * =======================*/
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-neutral-50 px-3 py-2 text-center">
      <div className="text-lg font-semibold text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}

/* =========================
 * Página
 * =======================*/
export default function StatsHome() {
  const [days, setDays] = useState<7 | 28>(7);
  const [series, setSeries] = useState<Snapshot[]>([]);
  const [vocs, setVocs] = useState<VRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Série de players online
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stats/online?days=${days}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('falha');
        const json: Snapshot[] = await res.json();
        setSeries(json);
      } catch {
        // fallback (para não ficar branco enquanto API não existe)
        setSeries(mockOnline(days));
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  // Distribuição de vocações
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/stats/vocations`, { cache: 'no-store' });
        if (!res.ok) throw new Error('falha');
        const json: VRow[] = await res.json();
        setVocs(json);
      } catch {
        // fallback plausível
        setVocs([
          { vocation: 'Knight', count: 320 },
          { vocation: 'Paladin', count: 270 },
          { vocation: 'Sorcerer', count: 210 },
          { vocation: 'Druid', count: 200 },
        ]);
      }
    })();
  }, []);

  // Métricas derivadas (atual, média, pico)
  const { current, avg, max } = useMemo(() => {
    if (!series.length) return { current: 0, avg: 0, max: 0 };
    const current = series[series.length - 1].online_count || 0;
    const sum = series.reduce((acc, s) => acc + (s.online_count || 0), 0);
    const avg = Math.round(sum / series.length);
    const max = Math.max(...series.map((s) => s.online_count || 0));
    return { current, avg, max };
  }, [series]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Estatísticas gerais</h1>

      {/* ====== topo: players + donut ====== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Gráfico de players */}
        <div className="lg:col-span-2 rounded-xl bg-white ring-1 ring-black/5 shadow-sm p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium">Players online</div>
            <div className="flex gap-2">
              <button
                onClick={() => setDays(7)}
                className={`rounded-full px-3 py-1.5 text-sm border ${
                  days === 7
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'hover:bg-neutral-50'
                }`}
              >
                7 dias
              </button>
              <button
                onClick={() => setDays(28)}
                className={`rounded-full px-3 py-1.5 text-sm border ${
                  days === 28
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'hover:bg-neutral-50'
                }`}
              >
                28 dias
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                Carregando…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 12, right: 10, left: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="onlineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e9ecef" />
                  <XAxis
                    dataKey="captured_at"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <RTooltip
                    content={<PrettyTooltip />}
                    formatter={(v: any) => fmt(Number(v))}
                    labelFormatter={(l) => l}
                  />
                  <Area
                    type="monotone"
                    dataKey="online_count"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fill="url(#onlineGradient)"
                    dot={false}
                    activeDot={{ r: 3 }}
                    name="Online"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Cards: Atual/Média/Pico */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Atual" value={fmt(current)} />
            <StatCard label="Média" value={fmt(avg)} />
            <StatCard label="Pico" value={fmt(max)} />
          </div>
        </div>

        {/* Donut de vocações */}
        <div className="rounded-xl bg-white ring-1 ring-black/5 shadow-sm p-4">
          <div className="mb-3 font-medium">Distribuição de vocações</div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vocs}
                  dataKey="count"
                  nameKey="vocation"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {vocs.map((v) => (
                    <Cell key={v.vocation} fill={VOCATION_COLORS[v.vocation] ?? '#8884d8'} />
                  ))}
                </Pie>
                <RTooltip
                  content={<PrettyTooltip />}
                  formatter={(v: any, n: any) => [`${fmt(Number(v))} jogadores`, n as string]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ====== Economia • Tibia Coins ====== */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Economia • Tibia Coins</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Receita estimada da CipSoft (mock baseado na série) */}
          <AreaCard
            title="Receita estimada da CipSoft"
            days={days}
            setDays={setDays}
            data={(series.length ? series : mockOnline(days)).map((d, i) => ({
              captured_at: d.captured_at,
              value: Math.round(140000 + 80000 * Math.sin(i / 10) + (d.online_count ?? 0) * 120),
            }))}
            color="#10b981"
            yTickFmt={fmtEURc}
            valueFmt={fmtEURc}
          />

          {/* Volume de TC no jogo (mock baseado na série) */}
          <AreaCard
            title="Volume de TC no jogo"
            days={days}
            setDays={setDays}
            data={(series.length ? series : mockOnline(days)).map((d, i) => ({
              captured_at: d.captured_at,
              value: Math.round(400000 + 350000 * Math.sin(i / 9) + (d.online_count ?? 0) * 50),
            }))}
            color="#f59e0b"
            yTickFmt={fmtTCc}
            valueFmt={fmtTCc}
          />
        </div>
      </section>
    </main>
  );
}
