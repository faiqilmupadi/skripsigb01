import { NextResponse } from "next/server";
import { historyOrderService } from "@/app/features/historyOrder/services/historyOrderService";

function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}
function jsonErr(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ ok: false as const, message, issues }, { status });
}

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parsePresetToRange(preset: string | null, start: string | null, end: string | null) {
  const p = String(preset ?? "7d").trim().toLowerCase();
  const today = new Date();
  const endYmd = toYmd(today);

  if (p === "custom") {
    const s = String(start ?? "").trim();
    const e = String(end ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !/^\d{4}-\d{2}-\d{2}$/.test(e)) {
      return { from: null, to: null, err: "Tanggal custom tidak valid" };
    }
    return { from: s, to: e, err: null };
  }

  // ✅ samain sama TimeRangeFilter kamu: 24h, 7d, 1m, 3m
  const mapDays: Record<string, number> = {
    "24h": 1,
    "7d": 7,
    "1m": 30,
    "3m": 90,
  };

  const days = mapDays[p] ?? 7;

  // range inclusive start (hari pertama) sampai hari ini
  const fromDate = new Date(today.getTime() - (days - 1) * 86400000);
  const fromYmd = toYmd(fromDate);

  return { from: fromYmd, to: endYmd, err: null };
}


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const preset = url.searchParams.get("preset");
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    const { from, to, err } = parsePresetToRange(preset, start, end);
    if (err) return jsonErr(err, 400);

    const data = await historyOrderService.list({ from: from!, to: to! });
    return jsonOk(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 500);
  }
}
