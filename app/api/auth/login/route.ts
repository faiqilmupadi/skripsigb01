import { NextResponse } from "next/server";
import { loginWithPassword } from "@/app/features/login/services/authService.server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await loginWithPassword(body);

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
    }

    const res = NextResponse.json({
      ok: true,
      redirectTo: result.redirectTo,
      user: result.user,
    });

    res.cookies.set({
      name: "session",
      value: result.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
