// app/api/adminGudang/katalogBarang/route.ts
import { NextResponse } from "next/server";
import { katalogBarangService } from "@/app/features/katalogBarang/services/katalogBarangService";
import { CreateBarangSchema } from "@/app/features/katalogBarang/types";

// GET: Mengambil semua data katalog
export async function GET() {
  try {
    const data = await katalogBarangService.list();
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("DATA DITERIMA API:", body); // Lihat ini di Terminal VS Code

    const validation = CreateBarangSchema.safeParse(body);
    
    if (!validation.success) {
      console.log("LOG ERROR VALIDASI:", validation.error.format()); // Lihat bagian mana yang salah
      return NextResponse.json(
        { ok: false, message: "Validasi gagal", issues: validation.error.format() },
        { status: 400 }
      );
    }

    const result = await katalogBarangService.create(validation.data);
    return NextResponse.json({ ok: true, data: result });
  } catch (error: any) {
    console.error("LOG ERROR DATABASE:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Gagal menambah barang" },
      { status: 500 }
    );
  }
}