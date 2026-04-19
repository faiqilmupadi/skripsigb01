import { NextResponse } from "next/server";
import { checkAndUpdateROP } from "@/app/features/notifikasiROP/services/notifikasiROP";

export async function GET() {
  try {
    const lowStockItems = await checkAndUpdateROP();
    return NextResponse.json({ data: lowStockItems });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Gagal memproses ROP" }, { status: 500 });
  }
}