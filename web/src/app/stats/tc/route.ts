import { NextRequest, NextResponse } from "next/server";

type TcRow = { date: string; bazaar_tc_volume: number; cip_revenue_eur: number };
const EUR_PER_TC = 0.08;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? "28");

  const N = days;
  const base = Date.now() - (N - 1) * 86400000;

  const data: TcRow[] = Array.from({ length: N }, (_, i) => {
    const date = new Date(base + i * 86400000).toISOString().slice(0, 10);
    const bazaar = Math.round(2_000_000 + 600_000 * Math.sin(i / 3) + Math.random() * 120_000);
    return {
      date,
      bazaar_tc_volume: bazaar,
      cip_revenue_eur: Math.round(bazaar * EUR_PER_TC),
    };
  });

  return NextResponse.json(data);
}
