import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    { vocation: "Knight", count: 340 },
    { vocation: "Paladin", count: 280 },
    { vocation: "Sorcerer", count: 210 },
    { vocation: "Druid", count: 190 },
  ];
  return NextResponse.json(data);
}
