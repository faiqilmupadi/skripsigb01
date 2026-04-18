import { NextRequest, NextResponse } from "next/server";
import { getVendorByUserId, getVendorPOs, updateVendorPOStatus } from "@/app/features/updateStatusBarang/services/updateStatusBarang";
import { decodeJwt } from "jose";

// Fungsi bantuan untuk mengekstrak userId dari Cookie sesi
function getUserIdFromToken(req: NextRequest): string | null {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const payload = decodeJwt(token);
    // JWT standar biasanya menyimpan ID di properti 'sub' atau 'userId'
    return (payload.sub || payload.userId) as string; 
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Ambil userId dari Token Auth
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized: Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    // 2. Cek apakah userId tersebut terdaftar sebagai Vendor
    const vendorInfo = await getVendorByUserId(userId);
    if (!vendorInfo) {
      return NextResponse.json({ message: "Akun Anda tidak memiliki akses atau tidak terdaftar sebagai entitas Vendor." }, { status: 403 });
    }

    // 3. Tarik PO khusus milik Vendor tersebut
    const data = await getVendorPOs(vendorInfo.kodeVendor);
    return NextResponse.json({ vendorInfo, data });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Validasi token di aksi PUT juga agar aman dari API abuse
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const body = await req.json();
    const { nomorPO, kodeVendor, status } = body;

    if (!nomorPO || !kodeVendor || !status) {
      return NextResponse.json({ message: "Data permintaan tidak lengkap." }, { status: 400 });
    }

    if (status === "Selesai") {
      return NextResponse.json({ message: "Akses ditolak: Vendor tidak dapat mengubah status menjadi Selesai." }, { status: 403 });
    }

    await updateVendorPOStatus(nomorPO, kodeVendor, status);
    return NextResponse.json({ message: "Status pesanan berhasil diperbarui." });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Terjadi kesalahan server." }, { status: 500 });
  }
}