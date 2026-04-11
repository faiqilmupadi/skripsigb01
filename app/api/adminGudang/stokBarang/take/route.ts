import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/features/login/services/sessionService.server";
import { takeStock, HttpError } from "@/app/features/stokBarang/services/stokBarangService";

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
    const partNumber = String(body?.partNumber ?? "").trim();
    const plant = String(body?.plant ?? "").trim();
    const quantity = Number(body?.quantity);

    if (!partNumber || !plant || !Number.isFinite(quantity) || quantity <= 0) {
      return jsonErr("Payload tidak valid", 400);
    }

    const out = await takeStock({ partNumber, plant, quantity }, user.username);
    return jsonOk(out, 201);
  } catch (e: any) {
    if (e?.message === "NO_SESSION") return jsonErr("Unauthorized", 401);
    const status = e instanceof HttpError ? e.status : 400;
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, status);
  }
}
