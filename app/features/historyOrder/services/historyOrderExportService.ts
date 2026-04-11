import { historyOrderService } from "./historyOrderService";

function toCsvValue(val: any) {
  if (val === null || val === undefined) return "";
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

export const historyOrderExportService = {
  async buildCsv(params?: { from?: string; to?: string }) {
    const data = await historyOrderService.list(params);

    const header = [
      "Movement ID",
      "Posting Date",
      "Part Number",
      "Plant",
      "Material Description",
      "Movement Type",
      "Quantity",
      "Order No",
      "Purchase Order",
      "User",
    ];

    const rows = data.map((r) => [
      r.movementId,
      r.postingDate,
      r.partNumber,
      r.plant,
      r.materialDescription,
      r.movementType,
      r.quantity,
      r.orderNo ?? "",
      r.purchaseOrder ?? "",
      r.userName,
    ]);

    const csv =
      [header, ...rows]
        .map((row) => row.map(toCsvValue).join(","))
        .join("\n");

    const filename = `history-order-${Date.now()}.csv`;

    return {
      filename,
      contentType: "text/csv; charset=utf-8",
      body: csv,
    };
  },
};
