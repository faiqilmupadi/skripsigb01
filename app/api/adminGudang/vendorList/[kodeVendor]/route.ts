import { NextRequest, NextResponse } from "next/server";
import {
  deleteVendorList,
  updateVendorList,
} from "@/app/features/vendorList/services/vendorListServices";

// 1. Ubah tipe Params menjadi Promise
type Params = { params: Promise<{ kodeVendor: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    // 2. Lakukan await pada params
    const { kodeVendor } = await params;

    const body = await req.json();
    const { kodeBarang, eum } = body;

    if (!kodeBarang || !eum) {
      return NextResponse.json({ message: "kodeBarang dan eum wajib diisi" }, { status: 400 });
    }

    await updateVendorList(kodeVendor, kodeBarang, { eum });
    return NextResponse.json({ message: "Vendor list berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // 3. Lakukan await pada params
    const { kodeVendor } = await params;

    const { searchParams } = new URL(req.url);
    const kodeBarang = searchParams.get("kodeBarang");

    if (!kodeBarang) {
      return NextResponse.json({ message: "Query param kodeBarang wajib diisi" }, { status: 400 });
    }

    await deleteVendorList(kodeVendor, kodeBarang);
    return NextResponse.json({ message: "Vendor list berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}