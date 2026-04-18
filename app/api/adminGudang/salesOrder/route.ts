import { NextRequest, NextResponse } from "next/server";
import { getSalesOrdersGrouped, getSOOptions, createSalesOrder } from "@/app/features/salesOrder/services/salesOrder";
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
    const data = await getSalesOrdersGrouped();
    const options = await getSOOptions();
    return NextResponse.json({ data, options });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Sesi tidak valid." }, { status: 401 });

    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) return NextResponse.json({ message: "Minimal keluarkan 1 barang." }, { status: 400 });

    await createSalesOrder({ userId, items });
    return NextResponse.json({ message: "Sales Order berhasil dikirim dan stok terpotong." }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}