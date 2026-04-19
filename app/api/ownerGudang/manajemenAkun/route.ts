import { NextRequest, NextResponse } from "next/server";
import { manajemenService } from "@/app/features/manajemenAkun/services/manajemenAkun";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type"); // 'admin' atau 'vendor'
  try {
    const data = type === "vendor" ? await manajemenService.getVendors() : await manajemenService.getUsers();
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  try {
    const body = await req.json();
    if (type === "vendor") {
      await manajemenService.createVendor(body);
    } else {
      await manajemenService.createUser(body);
    }
    return NextResponse.json({ ok: true, message: "Data berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }
}