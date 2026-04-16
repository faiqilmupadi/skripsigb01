import { NextRequest, NextResponse } from "next/server";
import {
  deleteVendor,
  updateVendor,
} from "@/app/features/vendorList/services/vendorListServices";

// 1. Ubah tipe Params menjadi Promise
type Params = { params: Promise<{ kodeVendor: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    // 2. Lakukan await pada params sebelum mengakses kodeVendor
    const { kodeVendor } = await params; 
    
    const body = await req.json();
    const { namaVendor, alamat } = body;

    if (!namaVendor) {
      return NextResponse.json({ message: "namaVendor wajib diisi" }, { status: 400 });
    }

    await updateVendor(kodeVendor, {
      namaVendor,
      alamat: alamat ?? "",
    });

    return NextResponse.json({ message: "Vendor berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // 3. Lakukan await pada params
    const { kodeVendor } = await params;
    
    await deleteVendor(kodeVendor);
    return NextResponse.json({ message: "Vendor berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}