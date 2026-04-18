import { NextRequest, NextResponse } from "next/server";
import { getAllStok, adjustStokBarang } from "@/app/features/stokBarang/services/stokBarang";
import { decodeJwt } from "jose";

function getUserIdFromToken(req: NextRequest): string | null {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const payload = decodeJwt(token);
    return (payload.sub || payload.userId) as string; 
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const data = await getAllStok();
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Sesi tidak valid." }, { status: 401 });

    const body = await req.json();
    if (!body.kodeBarang || !body.tipe || !body.qty) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    await adjustStokBarang(body, userId);
    
    return NextResponse.json({ message: "Penyesuaian stok berhasil dicatat." }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}