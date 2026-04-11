import { NextResponse } from "next/server";
import { katalogBarangService } from "@/app/features/katalogBarang/services/katalogBarangService";
import { CreateBarangSchema } from "@/app/features/katalogBarang/types";
import { getSessionUser } from "@/app/features/login/services/sessionService.server";
 // sesuaikan dengan implementasi session Anda

function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}
function jsonErr(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ ok: false as const, message, issues }, { status });
}

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await katalogBarangService.list();
    return jsonOk(rows);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(); // ✅ createdBy dari session

    const body = await req.json();
    const parsed = CreateBarangSchema.safeParse(body);
    if (!parsed.success) return jsonErr("Validasi gagal", 400, parsed.error.flatten());

    const created = await katalogBarangService.create(parsed.data, user.username);
    return jsonOk(created, 201);
  } catch (e: any) {
    if (e?.message === "NO_SESSION") return jsonErr("Unauthorized", 401);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 400);
  }
}
