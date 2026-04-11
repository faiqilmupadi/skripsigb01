// C:\Faiq\skripsi\skripsiku\app\features\stokBarang\services\restockService.ts
import { dbExec, dbQuery, dbTransaction, dbExecConn, dbQueryConn } from "@/app/lib/db.server";
import type { RestockRequestPayload, RestockReceivePayload, RestockNeedQCRow } from "@/app/features/stokBarang/types";
import { HttpError } from "@/app/features/stokBarang/services/stokBarangService";

type MasterDbRow = { materialDescription: string | null; baseUnitOfMeasure: string | null };

type NeedQCDbRow = {
  requestId: number | string;
  partNumber: string;
  plant: string;
  postingDate: string;
  purchaseOrder: string | null;
  requestedQty: string | number | null;
  quantity: string | number | null;
  receivedOn: string | null;
  deletedOn: string | null;
};

type StockRow = { deletedOn: string | null };

function random12Digits() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}
function normalizeQty(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return round3(x);
}
function toNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * ADMIN request restock (101)
 * - movementType=101
 * - purchaseOrder=12 digit (langsung ada)
 * - quantity=0 (belum QC)
 * - requestedQty=qty request (inilah yang bikin QC notif boleh muncul)
 * - receivedOn=NULL
 */
export async function adminRequestRestock(
  payload: RestockRequestPayload,
  userName = "admin_gudang"
): Promise<{ requestId: number; purchaseOrder: string }> {
  const partNumber = String(payload.partNumber ?? "").trim();
  const plant = String(payload.plant ?? "").trim();
  const reqQty = normalizeQty(payload.quantity);

  const by = (userName ?? "").trim() || "admin_gudang";

  if (!partNumber || !plant || !Number.isFinite(reqQty) || reqQty <= 0) {
    throw new HttpError(400, "Payload tidak valid");
  }

  // Cegah double request aktif (belum QC) untuk part+plant yang sama
  const active = await dbQuery<{ requestId: number | string }>(
    `
    SELECT movementId AS requestId
    FROM material_movement
    WHERE movementType='101'
      AND partNumber=?
      AND plant=?
      AND receivedOn IS NULL
      AND COALESCE(quantity,0)=0
      AND COALESCE(requestedQty,0) > 0
    LIMIT 1
    `,
    [partNumber, plant]
  );
  if (active.length) throw new HttpError(400, "Masih ada restock 101 yang belum QC untuk part & plant ini");

  const mm = await dbQuery<MasterDbRow>(
    `SELECT materialDescription, baseUnitOfMeasure FROM material_master WHERE partNumber=? LIMIT 1`,
    [partNumber]
  );
  const materialDescription = mm[0]?.materialDescription ?? null;
  const baseUnitOfMeasure = mm[0]?.baseUnitOfMeasure ?? null;

  const purchaseOrder = random12Digits();

  const res = await dbExec(
    `
    INSERT INTO material_movement
      (partNumber, plant, materialDescription, postingDate, movementType,
       orderNo, purchaseOrder, quantity, requestedQty, baseUnitOfMeasure, userName, receivedOn)
    VALUES
      (?, ?, ?, CURDATE(), '101',
       NULL, ?, 0, ?, ?, ?, NULL)
    `,
    [partNumber, plant, materialDescription, purchaseOrder, reqQty, baseUnitOfMeasure, by]
  );

  return { requestId: Number(res.insertId), purchaseOrder };
}

/**
 * LIST QC (notif Perlu QC)
 * SYARAT KETAT:
 * - movementType=101
 * - purchaseOrder NOT NULL (order admin)
 * - requestedQty > 0
 * - quantity=0
 * - receivedOn IS NULL
 */
export async function adminListNeedQC(): Promise<RestockNeedQCRow[]> {
  const rows = await dbQuery<NeedQCDbRow>(
    `
    SELECT
      m.movementId AS requestId,
      m.partNumber,
      m.plant,
      m.postingDate,
      m.purchaseOrder,
      m.requestedQty,
      m.quantity,
      m.receivedOn,
      s.deletedOn
    FROM material_movement m
    LEFT JOIN material_stock s
      ON s.partNumber = m.partNumber AND s.plant = m.plant
    WHERE m.movementType='101'
      AND m.receivedOn IS NULL
      AND m.purchaseOrder IS NOT NULL
      AND COALESCE(m.requestedQty,0) > 0
      AND COALESCE(m.quantity,0) = 0
    ORDER BY m.movementId DESC
    `
  );

  return rows
    .filter((r) => !r.deletedOn)
    .map((r) => ({
      requestId: Number(r.requestId),
      partNumber: r.partNumber,
      plant: r.plant,
      postingDate: r.postingDate,
      purchaseOrder: String(r.purchaseOrder ?? ""),
      requestedQty: toNum(r.requestedQty),
    }));
}

/**
 * QC RECEIVE (101)
 * - freeIn+blockedIn harus == requestedQty
 * - update material_stock (freeStock+, blocked+)
 * - finalize movement: quantity=total, receivedOn=NOW()
 */
export async function adminReceiveRestock(
  payload: RestockReceivePayload,
  userName = "admin_gudang"
): Promise<{ purchaseOrder: string }> {
  const requestId = Number(payload.requestId);
  const freeIn = normalizeQty(payload.freeIn);
  const blockedIn = normalizeQty(payload.blockedIn);

  const by = (userName ?? "").trim() || "admin_gudang";

  if (!Number.isFinite(requestId) || requestId <= 0) throw new HttpError(400, "requestId tidak valid");
  if (!Number.isFinite(freeIn) || freeIn < 0) throw new HttpError(400, "freeIn tidak valid");
  if (!Number.isFinite(blockedIn) || blockedIn < 0) throw new HttpError(400, "blockedIn tidak valid");

  const totalIn = normalizeQty(freeIn + blockedIn);
  if (totalIn <= 0) throw new HttpError(400, "Total masuk harus > 0");

  return dbTransaction(async (conn) => {
    const reqRows = await dbQueryConn<{
      movementId: number | string;
      partNumber: string;
      plant: string;
      purchaseOrder: string | null;
      requestedQty: string | number | null;
      quantity: string | number | null;
      receivedOn: string | null;
    }>(
      conn,
      `
      SELECT movementId, partNumber, plant, purchaseOrder, requestedQty, quantity, receivedOn
      FROM material_movement
      WHERE movementId=?
        AND movementType='101'
      LIMIT 1
      `,
      [requestId]
    );

    if (!reqRows.length) throw new HttpError(404, "Request 101 tidak ditemukan");
    if (reqRows[0].receivedOn) throw new HttpError(409, "Sudah QC");

    const partNumber = reqRows[0].partNumber;
    const plant = reqRows[0].plant;
    const po = String(reqRows[0].purchaseOrder ?? "");
    const reqQty = normalizeQty(toNum(reqRows[0].requestedQty));
    const qtyNow = normalizeQty(toNum(reqRows[0].quantity));

    // Kunci: QC hanya untuk yang masih 0
    if (qtyNow !== 0) throw new HttpError(409, "Movement sudah tidak eligible QC (quantity != 0)");
    if (!po) throw new HttpError(400, "purchaseOrder kosong");
    if (!reqQty || reqQty <= 0) throw new HttpError(400, "requestedQty invalid");

    if (normalizeQty(reqQty) !== totalIn) {
      throw new HttpError(400, `Total QC (${totalIn}) harus sama dengan request (${normalizeQty(reqQty)})`);
    }

    const stockRows = await dbQueryConn<StockRow>(
      conn,
      `SELECT deletedOn FROM material_stock WHERE partNumber=? AND plant=? LIMIT 1`,
      [partNumber, plant]
    );
    if (!stockRows.length || stockRows[0].deletedOn) throw new HttpError(404, "Stok tidak ditemukan");

    await dbExecConn(
      conn,
      `UPDATE material_stock SET freeStock = freeStock + ?, blocked = blocked + ? WHERE partNumber=? AND plant=?`,
      [freeIn, blockedIn, partNumber, plant]
    );

    await dbExecConn(
      conn,
      `
      UPDATE material_movement
      SET quantity=?, userName=?, receivedOn=NOW()
      WHERE movementId=?
        AND movementType='101'
        AND receivedOn IS NULL
        AND COALESCE(quantity,0)=0
      `,
      [totalIn, by, requestId]
    );

    return { purchaseOrder: po };
  });
}
