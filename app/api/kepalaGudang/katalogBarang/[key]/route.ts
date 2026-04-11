// app/api/kepalaGudang/katalogBarang/[key]/route.ts
import { NextResponse } from "next/server";
import { katalogBarangService } from "@/app/features/katalogBarang/services/katalogBarangService";
import { UpdateBarangSchema } from "@/app/features/katalogBarang/types";

function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}
function jsonErr(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ ok: false as const, message, issues }, { status });
}

function parseKey(raw: string | undefined) {
  const v = decodeURIComponent(String(raw ?? "")).trim();
  if (!v) return null;
  const [partNumber, plant] = v.split("__");
  if (!partNumber || !plant) return null;
  return { partNumber: partNumber.trim(), plant: plant.trim() };
}

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const { key } = await ctx.params;
    const parsed = parseKey(key);
    if (!parsed) return jsonErr("key tidak valid", 400);

    const row = await katalogBarangService.getByKey(
      parsed.partNumber,
      parsed.plant
    );
    if (!row) return jsonErr("Barang tidak ditemukan", 404);

    return jsonOk(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 500);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { key } = await ctx.params;
    const parsedKey = parseKey(key);
    if (!parsedKey) return jsonErr("key tidak valid", 400);

    const body = await req.json().catch(() => null);
    const parsedBody = UpdateBarangSchema.safeParse(body);
    if (!parsedBody.success)
      return jsonErr("Validasi gagal", 400, parsedBody.error.flatten());

    const updated = await katalogBarangService.update(
      parsedKey.partNumber,
      parsedKey.plant,
      parsedBody.data
    );
    if (!updated) return jsonErr("Barang tidak ditemukan", 404);

    return jsonOk(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    // kalau error dari DB / logic -> 400 cukup, tapi unknown -> 500
    const status = msg.toLowerCase().includes("unknown") ? 500 : 400;
    return jsonErr(msg, status);
  }
}

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const { key } = await ctx.params;
    const parsed = parseKey(key);
    if (!parsed) return jsonErr("key tidak valid", 400);

    const ok = await katalogBarangService.remove(parsed.partNumber, parsed.plant);
    if (!ok) return jsonErr("Barang tidak ditemukan", 404);

    return jsonOk(true);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 400);
  }
}
