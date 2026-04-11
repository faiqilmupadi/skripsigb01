// app/api/kepalaGudang/manajemenAkun/[userId]/route.ts
import { NextResponse } from "next/server";
import { accountsService } from "@/app/features/manajemenAkun/services/accountsService";
import { UpdateUserSchema } from "@/app/features/manajemenAkun/types";

function normalizeUserId(raw: string | undefined) {
  const v = decodeURIComponent(String(raw ?? "")).trim();
  if (!v) return null;
  return v;
}

function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}

function jsonErr(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ ok: false as const, message, issues }, { status });
}

// ✅ Next.js kamu: ctx.params adalah Promise → harus await
type Ctx = { params: Promise<{ userId: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const { userId } = await ctx.params;
    const id = normalizeUserId(userId);
    if (!id) return jsonErr("userId tidak valid", 400);

    const user = await accountsService.getById(id);
    if (!user) return jsonErr("User tidak ditemukan", 404);

    return jsonOk(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 500);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { userId } = await ctx.params;
    const id = normalizeUserId(userId);
    if (!id) return jsonErr("userId tidak valid", 400);

    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Validasi gagal", 400, parsed.error.flatten());
    }

    const updated = await accountsService.update(id, parsed.data);
    if (!updated) return jsonErr("User tidak ditemukan", 404);

    return jsonOk(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 400);
  }
}

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const { userId } = await ctx.params;
    const id = normalizeUserId(userId);
    if (!id) return jsonErr("userId tidak valid", 400);

    const removed = await accountsService.remove(id);
    if (!removed) return jsonErr("User tidak ditemukan", 404);

    // ✅ selalu ada data biar ensureOk enak
    return jsonOk(true);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 400);
  }
}
