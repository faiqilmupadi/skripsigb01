import { NextResponse } from "next/server";
import { getDashboardAnalisis } from "@/app/features/dashboardAnalisis/services/dashboardAnalisisService";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const data = await getDashboardAnalisis(url.searchParams);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}