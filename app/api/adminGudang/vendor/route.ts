import { NextRequest, NextResponse } from "next/server";
import {
  createVendor,
  getAllVendors,
} from "@/app/features/vendorList/services/vendorListServices";

export async function GET() {
  try {
    const data = await getAllVendors();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kodeVendor, namaVendor, alamat } = body;

    if (!kodeVendor || !namaVendor) {
      return NextResponse.json({ message: "kodeVendor dan namaVendor wajib diisi" }, { status: 400 });
    }

    // Pakai 'admin' sementara karena auth tidak dipakai
    await createVendor({ kodeVendor, namaVendor, alamat: alamat ?? "" }); 
    return NextResponse.json({ message: "Vendor berhasil ditambahkan" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}