import { NextRequest, NextResponse } from "next/server";
import { getPurchaseOrdersGrouped, getPOOptions, createPurchaseOrder, receivePurchaseOrder } from "@/app/features/purchaseOrder/services/purchaseOrder";
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
    const data = await getPurchaseOrdersGrouped();
    const options = await getPOOptions();
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
    const { kodeVendor, namaVendor, items } = body;

    if (!kodeVendor || items.length === 0) return NextResponse.json({ message: "Vendor dan Barang wajib diisi minimal 1" }, { status: 400 });

    await createPurchaseOrder({ kodeVendor, namaVendor, userId, items });
    return NextResponse.json({ message: "Purchase Order berhasil dibuat" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Sesi tidak valid." }, { status: 401 });

    const body = await req.json();
    const { nomorPO, catatan, itemsReceived } = body;

    if (!nomorPO || !itemsReceived) return NextResponse.json({ message: "Data penerimaan tidak lengkap." }, { status: 400 });

    // [REVISI] Lempar array barang aktual ke servis
    await receivePurchaseOrder(nomorPO, catatan, userId, itemsReceived);
    
    return NextResponse.json({ message: "Barang berhasil diterima dan fisik tercatat." });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}