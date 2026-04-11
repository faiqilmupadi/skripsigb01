// app/api/kepalaGudang/manajemenAkun/route.ts
import { NextResponse } from "next/server";
import { accountsService } from "@/app/features/manajemenAkun/services/accountsService";
import { CreateUserSchema } from "@/app/features/manajemenAkun/types";

function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}

function jsonErr(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ ok: false as const, message, issues }, { status });
}

export async function GET() {
  try {
    const users = await accountsService.list();
    return jsonOk(users);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateUserSchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Validasi gagal", 400, parsed.error.flatten());
    }

    const created = await accountsService.create(parsed.data);
    return jsonOk(created, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonErr(msg, 400);
  }
}
