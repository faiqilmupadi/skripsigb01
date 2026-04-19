import { NextRequest, NextResponse } from "next/server";
import { getDashboardData, getPOByStatus } from "@/app/features/dashboardAnalisis/services/dashboardService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const poStatus = searchParams.get("poStatus");

  try {
    if (poStatus) {
      const poData = await getPOByStatus(poStatus);
      return NextResponse.json({ data: poData });
    }

    if (!start || !end) return NextResponse.json({ message: "Range tanggal diperlukan" }, { status: 400 });
    
    const dashboard = await getDashboardData(start, end);
    return NextResponse.json({ data: dashboard });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}