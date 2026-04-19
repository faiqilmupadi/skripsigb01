import { NextRequest, NextResponse } from "next/server";
import { getRiwayatTransaksi } from "@/app/features/riwayatTransaksi/services/riwayatTransaksi";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ ok: false, message: "Parameter start dan end wajib diisi." }, { status: 400 });
  }

  try {
    const data = await getRiwayatTransaksi(start, end);
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}