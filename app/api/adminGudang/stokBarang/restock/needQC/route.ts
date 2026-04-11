import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/features/login/services/sessionService.server";
import { adminListNeedQC } from "@/app/features/stokBarang/services/restockService";

function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}
function jsonErr(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ ok: false as const, message, issues }, { status });
}

export const runtime = "nodejs";

export async function GET() {
  try {
    await getSessionUser();

    const rows = await adminListNeedQC();

    // ✅ safety filter: jangan tampilkan QC kalau belum ada requestQty valid
    const filtered = rows.filter((r) => Number(r.requestedQty) > 0);

    return jsonOk(filtered);
  } catch (e: any) {
    if (e?.message === "NO_SESSION") return jsonErr("Unauthorized", 401);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 500);
  }
}
