import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/features/login/services/sessionService.server";
import { adminReceiveRestock } from "@/app/features/stokBarang/services/restockService";
import { HttpError } from "@/app/features/stokBarang/services/stokBarangService";

function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}
function jsonErr(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ ok: false as const, message, issues }, { status });
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();

    const body = await req.json().catch(() => null);
    const requestId = Number(body?.requestId);
    const freeIn = Number(body?.freeIn);
    const blockedIn = Number(body?.blockedIn);

    if (!Number.isFinite(requestId) || requestId <= 0) return jsonErr("requestId tidak valid", 400);
    if (!Number.isFinite(freeIn) || freeIn < 0) return jsonErr("freeIn tidak valid", 400);
    if (!Number.isFinite(blockedIn) || blockedIn < 0) return jsonErr("blockedIn tidak valid", 400);

    const out = await adminReceiveRestock({ requestId, freeIn, blockedIn }, user.username);
    return jsonOk(out, 201);
  } catch (e: any) {
    if (e?.message === "NO_SESSION") return jsonErr("Unauthorized", 401);
    const status = e instanceof HttpError ? e.status : 400;
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, status);
  }
}
