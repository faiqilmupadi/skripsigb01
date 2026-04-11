import { NextResponse } from "next/server";
import { historyOrderExportService } from "@/app/features/historyOrder/services/historyOrderExportService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const file = await historyOrderExportService.buildCsv({ from, to });

    return new NextResponse(file.body, {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to export" }, { status: 500 });
  }
}
