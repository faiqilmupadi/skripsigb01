import { dbQuery } from "@/app/lib/db.server";
import type { HistoryOrderRow } from "@/app/features/historyOrder/types";

type MovementDbRow = {
  movementId: number;
  partNumber: string;
  plant: string;
  materialDescription: string;
  postingDate: string | Date | null;
  movementType: string | number;
  orderNo: string | null;
  purchaseOrder: string | null;
  quantity: string | number;
  userName: string | null;
};

/**
 * Convert DATE/DATETIME dari DB menjadi ISO string.
 * Tidak akan throw error walaupun format tidak valid.
 */
function toIso(v: string | Date | null): string {
  if (!v) return "";

  // Case: Date object valid
  if (v instanceof Date) {
    return Number.isFinite(v.getTime()) ? v.toISOString() : "";
  }

  const raw = String(v).trim();
  if (!raw) return "";

  // Case: DATE -> "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00.000Z`).toISOString();
  }

  // Case: DATETIME -> "YYYY-MM-DD HH:mm:ss"
  // Anggap waktu lokal Indonesia (+07:00)
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(raw)) {
    return new Date(raw.replace(" ", "T") + "+07:00").toISOString();
  }

  // Fallback native parse
  const d = new Date(raw);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
}

function toNumber(v: string | number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Normalize date filter agar hanya format YYYY-MM-DD yang lolos.
 */
function normalizeYmd(raw?: string | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;

  const dateOnly = v.includes("T") ? v.slice(0, 10) : v;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;

  return dateOnly;
}

export const historyOrderService = {
  async list(params?: { from?: string; to?: string }): Promise<HistoryOrderRow[]> {
    const from = normalizeYmd(params?.from);
    const to = normalizeYmd(params?.to);

    const where: string[] = [];
    const values: any[] = [];

    // start inclusive
    if (from) {
      where.push("postingDate >= ?");
      values.push(from);
    }

    // end exclusive
    if (to) {
      where.push("postingDate < DATE_ADD(?, INTERVAL 1 DAY)");
      values.push(to);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await dbQuery<MovementDbRow>(
      `
      SELECT
        movementId,
        partNumber,
        plant,
        materialDescription,
        postingDate,
        movementType,
        orderNo,
        purchaseOrder,
        quantity,
        userName
      FROM material_movement
      ${whereSql}
      ORDER BY postingDate DESC, movementId DESC
      `,
      values
    );

    return rows.map((r) => ({
      movementId: r.movementId,
      partNumber: String(r.partNumber),
      plant: String(r.plant),
      materialDescription: String(r.materialDescription),
      purchaseOrder: r.purchaseOrder ? String(r.purchaseOrder) : null,
      orderNo: r.orderNo ? String(r.orderNo) : null,
      movementType: String(r.movementType),
      quantity: toNumber(r.quantity),
      userName: String(r.userName ?? "-"),
      postingDate: toIso(r.postingDate) || "-", // 🔥 Anti crash
    }));
  },
};
