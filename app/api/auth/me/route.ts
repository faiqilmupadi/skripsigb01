import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/features/login/services/sessionService.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }
}
