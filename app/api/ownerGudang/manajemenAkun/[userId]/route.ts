import { NextRequest, NextResponse } from "next/server";
import { manajemenService } from "@/app/features/manajemenAkun/services/manajemenAkun";

type Props = { params: Promise<{ userId: string }> };

export async function PUT(req: NextRequest, { params }: Props) {
  const type = req.nextUrl.searchParams.get("type");
  try {
    const { userId } = await params; // Next.js 15+ wajib await params
    const body = await req.json();
    
    if (type === "vendor") await manajemenService.updateVendor(userId, body);
    else await manajemenService.updateUser(userId, body);
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const type = req.nextUrl.searchParams.get("type");
  try {
    const { userId } = await params;
    
    if (type === "vendor") await manajemenService.deleteVendor(userId);
    else await manajemenService.deleteUser(userId);
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }
}