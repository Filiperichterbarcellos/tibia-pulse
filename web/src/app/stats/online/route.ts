import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

type SnapRow = {
  captured_at: string;           // vem do banco
  online_count: number | null;   // pode vir null
};

type OutRow = { captured_at: string; online_count: number };

// --- MOCK para quando a tabela estiver vazia / erro ---
function mockOnline(days: number): OutRow[] {
  const points = days * 24; // 1 ponto por hora
  const base = Date.now() - (points - 1) * 3600000;
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(base + i * 3600000);
    const label = t.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
    });
    const val = Math.round(120 + 60 * Math.sin(i / 6) + Math.random() * 15);
    return { captured_at: label, online_count: val };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? "7");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const sb = supabaseAdmin();

    // TIPAGEM explícita (evita 'never[]')
    const { data, error } = await sb
      .from("worlds_online_snapshots")
      .select("captured_at, online_count")
      .gte("captured_at", since.toISOString())
      .order("captured_at", { ascending: true });

    if (error) {
      console.error("[/api/stats/online] supabase error:", error);
      return NextResponse.json(mockOnline(days), { status: 200 });
    }

    // força o tipo aqui:
    const rows: SnapRow[] = (Array.isArray(data) ? data : []) as SnapRow[];

    if (!rows.length) {
      return NextResponse.json(mockOnline(days), { status: 200 });
    }

    // agrega por HORA (ano-mês-dia hora:00)
    const byHour = new Map<string, number>();
    for (const row of rows) {
      const d = new Date(row.captured_at);
      const key = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours()
      ).toISOString();

      const val = row.online_count ?? 0;
      byHour.set(key, (byHour.get(key) ?? 0) + val);
    }

    // normaliza + rótulo pt-BR
    const out: OutRow[] = Array.from(byHour.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([iso, val]) => {
        const t = new Date(iso);
        const label = t.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
        });
        return { captured_at: label, online_count: val };
      });

    return NextResponse.json(out, { status: 200 });
  } catch (e) {
    console.error("[/api/stats/online] unexpected:", e);
    return NextResponse.json(mockOnline(days), { status: 200 });
  }
}
