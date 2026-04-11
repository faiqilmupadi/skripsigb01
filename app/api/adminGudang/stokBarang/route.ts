import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/features/login/services/sessionService.server";
import { getStockList } from "@/app/features/stokBarang/services/stokBarangService";

function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}
function jsonErr(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ ok: false as const, message, issues }, { status });
}

export const runtime = "nodejs";

export async function GET() {
  try {
    await getSessionUser(); // ✅ hanya memastikan user login
    const rows = await getStockList();
    return jsonOk(rows);
  } catch (e: any) {
    if (e?.message === "NO_SESSION") return jsonErr("Unauthorized", 401);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 500);
  }
}
