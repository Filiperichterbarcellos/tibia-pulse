'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/** ===== Tipos do payload ===== */
type TDCharacter = {
  name: string;
  former_names?: string[];
  sex: string;
  title?: string | null;
  unlocked_titles?: number;
  vocation: string;
  level: number;
  achievement_points?: number;
  world: string;
  residence?: string;
  houses?: { name: string }[];
  last_login?: string | null;
  account_status?: string;
  experience_history?: ExpPoint[]; // pode vir no v4 para alguns casos
  experience_points?: number;      // injetado pela rota (do v3)
  experience?: number;             // fallback
};

type Death = {
  time: string;
  level: number;
  reason?: string;
  killers?: { name?: string; player?: boolean }[];
};

type ExpPoint = {
  date: string;                      // 'YYYY-MM-DD'
  experience?: number | null;        // total acumulado
  experience_delta?: number | null;  // ganho do dia
};

type APIOk = {
  character: {
    character: TDCharacter;
    deaths?: Death[];
    experience_history?: ExpPoint[]; // às vezes vem aqui fora
  };
  information: any;
  status: { http_code: number };
};

/** ===== Helpers ===== */
function fmtNumber(n?: number | null) {
  if (n == null || Number.isNaN(n)) return '-';
  return Number(n).toLocaleString();
}

/** XP mínimo para um nível L (fórmula oficial do Tibia) */
function xpMinForLevel(L: number): number {
  // exp(L) = floor(50 * L^3 - 150 * L^2 + 400 * L) / 3
  const l = Number(L) || 0;
  const val = (50 * l ** 3 - 150 * l ** 2 + 400 * l) / 3;
  return Math.max(0, Math.floor(val));
}

/** XP para passar do nível L para L+1 (estimativa do "recorde" de um dia) */
function xpToNextLevel(L: number): number {
  return xpMinForLevel(L + 1) - xpMinForLevel(L);
}

/** ===== Componentes locais (UI simples, sem libs externas) ===== */
function DeathsCard({ deaths }: { deaths?: Death[] }) {
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

function XPStats({
  points,
  estimatedRecord,
}: {
  points?: ExpPoint[];
  estimatedRecord?: number | null;
}) {
  const data = Array.isArray(points) ? [...points] : [];
  data.sort((a, b) => a.date.localeCompare(b.date));

  const recordReal = data.reduce((max, p) => {
    const v = Number(p.experience_delta ?? 0);
    return v > max ? v : max;
  }, 0);

  const showEstimate = !data.length && estimatedRecord != null;

  return (
    <div className="border rounded p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-medium">XP por dia</div>
        <div className="text-sm">
          Recorde pessoal:{' '}
          <b>
            {recordReal
              ? fmtNumber(recordReal)
              : showEstimate
              ? `${fmtNumber(estimatedRecord)} (estimado)`
              : '0'}
          </b>
        </div>
      </div>

      {!data.length ? (
        <div className="text-sm text-neutral-600 space-y-2">
          <div>Sem histórico de experiência disponível.</div>
          {showEstimate && (
            <div className="text-xs">
              Estimativa de recorde: ganhar o equivalente a subir 1 nível em um dia (
              {fmtNumber(estimatedRecord)} XP).
            </div>
          )}
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
                  <td className="py-2 pr-3">{fmtNumber(p.experience_delta)}</td>
                  <td className="py-2 pr-3">{fmtNumber(p.experience)}</td>
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

/** ===== Página ===== */
export default function CharacterPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [nameInput, setNameInput] = useState(sp.get('name') ?? '');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<APIOk | null>(null);

  // Histórico vindo do Supabase (/api/character/xp-history)
  const [xpHistory, setXpHistory] = useState<
    Array<{ date: string; experience: number | null; experience_delta: number | null }>
  >([]);

  const name = (sp.get('name') ?? '').trim();

  /** Busca dados do personagem (rota /api/character) */
  useEffect(() => {
    if (!name) return;
    (async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setData(null);
      try {
        const res = await fetch(`/api/character?name=${encodeURIComponent(name)}`, {
          cache: 'no-store',
        });
        const body = await res.json().catch(() => null);

        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setError(body?.error || 'Falha ao buscar personagem.');
          return;
        }
        setData(body as APIOk);
      } catch (e: any) {
        setError(e?.message ?? 'Erro inesperado ao buscar personagem.');
      } finally {
        setLoading(false);
      }
    })();
  }, [name]);

  /** Busca histórico do Supabase (rota /api/character/xp-history) */
  useEffect(() => {
    if (!name) {
      setXpHistory([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `/api/character/xp-history?name=${encodeURIComponent(name)}&days=14`,
          { cache: 'no-store' }
        );
        if (!res.ok) {
          setXpHistory([]);
          return;
        }
        const json = await res.json();
        setXpHistory(Array.isArray(json?.history) ? json.history : []);
      } catch {
        setXpHistory([]);
      }
    })();
  }, [name]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    router.push(`/character?name=${encodeURIComponent(nameInput.trim())}`);
  }

  const char = data?.character?.character;
  const deaths = data?.character?.deaths ?? [];

  // Histórico de XP preferindo o do Supabase; fallback pro payload externo:
  const apiExpHistory: ExpPoint[] =
    (char?.experience_history as ExpPoint[] | undefined) ??
    (data?.character?.experience_history as ExpPoint[] | undefined) ??
    [];
  const expHistory: ExpPoint[] = xpHistory.length ? xpHistory : apiExpHistory;

  // XP oficial que veio da API (v4/v3) — pode não existir
  const xpApi =
    (char as any)?.experience_points ??
    (char as any)?.experience ??
    undefined;

  // Fallback: XP mínimo do nível (estimado) se a API não trouxe
  const xpEffective = xpApi ?? (char?.level != null ? xpMinForLevel(char.level) : undefined);
  const isEstimated = xpApi == null && xpEffective != null;

  // Estimativa de “recorde pessoal” (se não houver histórico): XP para subir 1 nível
  const estimatedRecord = char?.level != null ? xpToNextLevel(char.level) : null;

  /** Snapshot diário automático no Supabase (best-effort) */
  useEffect(() => {
    if (!char?.name || !char?.world) return;
    if (xpEffective == null) return;

    const key = `snapshot:${char.name}:${new Date().toISOString().slice(0, 10)}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) return;

    (async () => {
      try {
        await fetch('/api/ingest/character-snapshot', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: char.name,
            world: char.world,
            experience: Number(xpEffective),
          }),
        });
        if (typeof window !== 'undefined') sessionStorage.setItem(key, '1');
      } catch {
        // silencioso
      }
    })();
  }, [char?.name, char?.world, xpEffective]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Buscar personagem</h1>

      <form onSubmit={onSubmit} className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ex.: Dodaq"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-orange-600 text-white hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      {loading && <div className="border rounded p-3">Carregando…</div>}

      {notFound && (
        <div className="border border-red-300 text-red-700 rounded p-3">
          Personagem não encontrado.
        </div>
      )}

      {error && (
        <div className="border border-red-300 text-red-700 rounded p-3">
          Erro: {error}
        </div>
      )}

      {char && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Card do personagem */}
          <div className="border rounded p-4 space-y-2">
            <div className="text-xl font-medium">{char.name}</div>
            <div>Mundo: <b>{char.world}</b></div>
            <div>Vocação: <b>{char.vocation}</b></div>
            <div>Nível: <b>{char.level}</b></div>

            <div>
              XP total:{' '}
              <b>{xpEffective != null ? fmtNumber(xpEffective) : 'indisponível'}</b>
              {isEstimated && (
                <span className="text-xs text-neutral-500 ml-2">(estimado pelo nível)</span>
              )}
            </div>

            {char.residence && <div>Residência: {char.residence}</div>}
            {char.last_login && (
              <div>Último login: {new Date(char.last_login).toLocaleString()}</div>
            )}
            {Array.isArray(char.houses) && char.houses.length > 0 && (
              <div>Casas: {char.houses.map((h) => h.name).join(', ')}</div>
            )}
          </div>

          {/* XP por dia + recorde (com fallback estimado) */}
          <XPStats points={expHistory} estimatedRecord={estimatedRecord ?? undefined} />

          {/* Mortes recentes */}
          <div className="md:col-span-2">
            <DeathsCard deaths={deaths} />
          </div>
        </div>
      )}
    </div>
  );
}
