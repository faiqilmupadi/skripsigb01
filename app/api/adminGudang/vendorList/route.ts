import { NextRequest, NextResponse } from "next/server";
import {
  createVendorList,
  getAllVendorList,
} from "@/app/features/vendorList/services/vendorListServices";

export async function GET() {
  try {
    const data = await getAllVendorList();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kodeVendor, namaVendor, kodeBarang, eum } = body;

    if (!kodeVendor || !kodeBarang || !eum) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    await createVendorList({ kodeVendor, namaVendor, kodeBarang, eum });
    return NextResponse.json({ message: "Vendor list berhasil ditambahkan" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan" }, { status: 500 });
  }
}