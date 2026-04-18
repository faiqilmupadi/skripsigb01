import { NextRequest, NextResponse } from "next/server";
import {
  createVendorList,
  getAllVendorList,
  getBarangOptions
} from "@/app/features/vendorList/services/vendorListServices";

export async function GET() {
  try {
    const data = await getAllVendorList();
    const barangOptions = await getBarangOptions();
    
    // Kirimkan sebagai object berisi data tabel dan opsi select
    return NextResponse.json({ data, barangOptions });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kodeVendor, namaVendor, kodeBarang, namaBarang, warnaBarang, hargaDariVendor, eum } = body;

    if (!kodeVendor || !kodeBarang || !eum || hargaDariVendor === "") {
      return NextResponse.json({ message: "Data wajib tidak lengkap" }, { status: 400 });
    }

    await createVendorList({ kodeVendor, namaVendor, kodeBarang, namaBarang, warnaBarang, hargaDariVendor, eum });
    return NextResponse.json({ message: "Vendor list berhasil ditambahkan" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}