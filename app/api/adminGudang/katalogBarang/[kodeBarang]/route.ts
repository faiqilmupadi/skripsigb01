// app/api/adminGudang/katalogBarang/[kodeBarang]/route.ts
import { NextResponse } from "next/server";
import { katalogBarangService } from "@/app/features/katalogBarang/services/katalogBarangService";

type Props = {
  params: Promise<{ kodeBarang: string }>;
};

export async function DELETE(req: Request, { params }: Props) {
  try {
    // 1. Ambil params (Next.js 15+ wajib await)
    const resolvedParams = await params;
    const kode = resolvedParams.kodeBarang;

    console.log("==> API Menerima Request Hapus untuk Kode:", kode);

    // 2. Panggil service
    await katalogBarangService.remove(kode);
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("==> API DELETE Error:", error.message);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Props) {
  try {
    const { kodeBarang } = await params;
    const body = await req.json();
    
    await katalogBarangService.update(kodeBarang, body);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}