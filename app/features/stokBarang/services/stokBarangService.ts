// C:\Faiq\skripsi\skripsiku\app\features\stokBarang\services\stokBarangService.ts
import { dbQuery, dbTransaction, dbQueryConn, dbExecConn } from "@/app/lib/db.server";
import type { StockRow, LowStockRow, TakePayload, ReturnPayload } from "@/app/features/stokBarang/types";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function random12Digits() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
}

function toNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

type StockListDbRow = {
  partNumber: string;
  plant: string;
  materialDescription: string | null;
  freeStock: string | number;
  blocked: string | number;
  reorderPoint: string | number;
  deletedOn: string | null;
};

type StockCheckDbRow = {
  freeStock?: string | number;
  blocked?: string | number;
  deletedOn?: string | null;
};

type MasterDbRow = {
  materialDescription: string | null;
  baseUnitOfMeasure: string | null;
};

// =========================
// GET LIST
// =========================
export async function getStockList(): Promise<StockRow[]> {
  const rows = await dbQuery<StockListDbRow>(
    `
    SELECT
      s.partNumber,
      s.plant,
      mm.materialDescription,
      s.freeStock,
      s.blocked,
      COALESCE(mpd.reorderPoint, 0) AS reorderPoint,
      s.deletedOn
    FROM material_stock s
    LEFT JOIN material_master mm
      ON mm.partNumber = s.partNumber
    LEFT JOIN material_plant_data mpd
      ON mpd.partNumber = s.partNumber AND mpd.plant = s.plant
    WHERE s.deletedOn IS NULL
    ORDER BY s.partNumber ASC, s.plant ASC
    `
  );

  return rows.map((r) => ({
    partNumber: r.partNumber,
    plant: r.plant,
    materialDescription: r.materialDescription ?? "-",
    freeStock: toNum(r.freeStock),
    blockedStock: toNum(r.blocked),
    reorderPoint: toNum(r.reorderPoint),
  }));
}

/**
 * LOW STOCK: freeStock <= ROP (ROp boleh 0)
 * contoh:
 *  - free=20 rop=0 => false (ga muncul)
 *  - free=0 rop=0  => true (muncul)
 */
export async function getLowStockList(): Promise<LowStockRow[]> {
  const rows = await dbQuery<StockListDbRow>(
    `
    SELECT
      s.partNumber,
      s.plant,
      mm.materialDescription,
      s.freeStock,
      s.blocked,
      COALESCE(mpd.reorderPoint, 0) AS reorderPoint,
      s.deletedOn
    FROM material_stock s
    LEFT JOIN material_master mm
      ON mm.partNumber = s.partNumber
    LEFT JOIN material_plant_data mpd
      ON mpd.partNumber = s.partNumber AND mpd.plant = s.plant
    WHERE s.deletedOn IS NULL
      AND s.freeStock <= COALESCE(mpd.reorderPoint, 0)
    ORDER BY (COALESCE(mpd.reorderPoint,0) - s.freeStock) DESC
    `
  );

  return rows.map((r) => ({
    partNumber: r.partNumber,
    plant: r.plant,
    materialDescription: r.materialDescription ?? "-",
    freeStock: toNum(r.freeStock),
    blockedStock: toNum(r.blocked),
    reorderPoint: toNum(r.reorderPoint),
  }));
}

// =========================
// TAKE (261)
// =========================
export async function takeStock(payload: TakePayload, userName = "admin_gudang"): Promise<{ orderNo: string }> {
  const partNumber = String(payload.partNumber ?? "").trim();
  const plant = String(payload.plant ?? "").trim();
  const quantity = Number(payload.quantity);

  const by = (userName ?? "").trim() || "admin_gudang";

  if (!partNumber || !plant || !Number.isFinite(quantity) || quantity <= 0) {
    throw new HttpError(400, "Payload tidak valid");
  }

  return dbTransaction(async (conn) => {
    const stockRows = await dbQueryConn<StockCheckDbRow>(
      conn,
      `SELECT freeStock, deletedOn FROM material_stock WHERE partNumber=? AND plant=? LIMIT 1`,
      [partNumber, plant]
    );

    if (!stockRows.length || stockRows[0].deletedOn) throw new HttpError(404, "Stok tidak ditemukan");

    const freeStock = toNum(stockRows[0].freeStock);
    if (freeStock < quantity) throw new HttpError(400, "Free stock tidak cukup");

    await dbExecConn(conn, `UPDATE material_stock SET freeStock = freeStock - ? WHERE partNumber=? AND plant=?`, [
      quantity,
      partNumber,
      plant,
    ]);

    const mm = await dbQueryConn<MasterDbRow>(
      conn,
      `SELECT materialDescription, baseUnitOfMeasure FROM material_master WHERE partNumber=? LIMIT 1`,
      [partNumber]
    );

    const materialDescription = mm?.[0]?.materialDescription ?? null;
    const baseUnitOfMeasure = mm?.[0]?.baseUnitOfMeasure ?? null;

    const orderNo = random12Digits();

    await dbExecConn(
      conn,
      `
      INSERT INTO material_movement
        (partNumber, plant, materialDescription, postingDate, movementType, orderNo, purchaseOrder, quantity, baseUnitOfMeasure, userName)
      VALUES
        (?, ?, ?, CURDATE(), '261', ?, NULL, ?, ?, ?)
      `,
      [partNumber, plant, materialDescription, orderNo, -quantity, baseUnitOfMeasure, by]
    );

    return { orderNo };
  });
}

// =========================
// RETURN (Z48) - kurangi blocked
// =========================
export async function returnStock(payload: ReturnPayload, userName = "admin_gudang"): Promise<void> {
  const partNumber = String(payload.partNumber ?? "").trim();
  const plant = String(payload.plant ?? "").trim();
  const quantity = Number(payload.quantity);

  const by = (userName ?? "").trim() || "admin_gudang";

  if (!partNumber || !plant || !Number.isFinite(quantity) || quantity <= 0) {
    throw new HttpError(400, "Payload tidak valid");
  }

  await dbTransaction(async (conn) => {
    const stockRows = await dbQueryConn<StockCheckDbRow>(
      conn,
      `SELECT blocked, deletedOn FROM material_stock WHERE partNumber=? AND plant=? LIMIT 1`,
      [partNumber, plant]
    );

    if (!stockRows.length || stockRows[0].deletedOn) throw new HttpError(404, "Stok tidak ditemukan");

    const blocked = toNum(stockRows[0].blocked);
    if (blocked < quantity) throw new HttpError(400, "Blocked stock tidak cukup");

    await dbExecConn(conn, `UPDATE material_stock SET blocked = blocked - ? WHERE partNumber=? AND plant=?`, [
      quantity,
      partNumber,
      plant,
    ]);

    const mm = await dbQueryConn<MasterDbRow>(
      conn,
      `SELECT materialDescription, baseUnitOfMeasure FROM material_master WHERE partNumber=? LIMIT 1`,
      [partNumber]
    );

    const materialDescription = mm?.[0]?.materialDescription ?? null;
    const baseUnitOfMeasure = mm?.[0]?.baseUnitOfMeasure ?? null;

    await dbExecConn(
      conn,
      `
      INSERT INTO material_movement
        (partNumber, plant, materialDescription, postingDate, movementType, orderNo, purchaseOrder, quantity, baseUnitOfMeasure, userName)
      VALUES
        (?, ?, ?, CURDATE(), 'Z48', NULL, NULL, ?, ?, ?)
      `,
      [partNumber, plant, materialDescription, -quantity, baseUnitOfMeasure, by]
    );
  });
}
