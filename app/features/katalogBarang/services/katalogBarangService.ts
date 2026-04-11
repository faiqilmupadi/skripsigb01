import { dbQuery } from "@/app/lib/db.server";
import type {
  CreateBarangInput,
  KatalogBarangRow,
  UpdateBarangInput,
} from "@/app/features/katalogBarang/types";

type DbRow = {
  partNumber: string;
  plant: string;
  freeStock: string | number;
  materialDescription: string;
  baseUnitOfMeasure: string;
  reorderPoint: string | number;
  safetyStock: string | number;
  materialGroup: string | null;
  createdBy: string | null;
  createdOn: Date | string;
};

const toISO = (v: Date | string) => new Date(v).toISOString();
const toNum = (v: string | number) => Number(v);

function toRow(r: DbRow): KatalogBarangRow {
  return {
    partNumber: r.partNumber,
    plant: r.plant,
    freeStock: toNum(r.freeStock),
    materialDescription: r.materialDescription,
    baseUnitOfMeasure: r.baseUnitOfMeasure,
    reorderPoint: toNum(r.reorderPoint),
    safetyStock: toNum(r.safetyStock),
    materialGroup: r.materialGroup,
    createdBy: r.createdBy,
    createdOn: toISO(r.createdOn),
  };
}

function normalizeKey(partNumber: string, plant: string) {
  const pn = String(partNumber ?? "").trim();
  const pl = String(plant ?? "").trim();
  if (!pn || !pl) throw new Error("key tidak valid");
  return { partNumber: pn, plant: pl };
}

function assertNonNegative(label: string, v: unknown) {
  if (v === undefined) return;
  const n = Number(v);
  if (!Number.isFinite(n) || Number.isNaN(n)) throw new Error(`${label} harus angka`);
  if (n < 0) throw new Error(`${label} tidak boleh negatif`);
}

export const katalogBarangService = {
  async list(): Promise<KatalogBarangRow[]> {
    const rows = await dbQuery<DbRow>(
      `SELECT
         ms.partNumber,
         ms.plant,
         ms.freeStock,
         mm.materialDescription,
         mm.baseUnitOfMeasure,
         mpd.reorderPoint,
         mpd.safetyStock,
         mm.materialGroup,
         mm.createdBy,
         mm.createdOn
       FROM material_stock ms
       JOIN material_master mm ON mm.partNumber = ms.partNumber
       JOIN material_plant_data mpd ON mpd.partNumber = ms.partNumber AND mpd.plant = ms.plant
       WHERE ms.deletedOn IS NULL AND mpd.deletedOn IS NULL
       ORDER BY mm.createdOn DESC, ms.partNumber ASC, ms.plant ASC`
    );

    return rows.map(toRow);
  },

  async getByKey(partNumber: string, plant: string): Promise<KatalogBarangRow | null> {
    const k = normalizeKey(partNumber, plant);
    const rows = await dbQuery<DbRow>(
      `SELECT
         ms.partNumber,
         ms.plant,
         ms.freeStock,
         mm.materialDescription,
         mm.baseUnitOfMeasure,
         mpd.reorderPoint,
         mpd.safetyStock,
         mm.materialGroup,
         mm.createdBy,
         mm.createdOn
       FROM material_stock ms
       JOIN material_master mm ON mm.partNumber = ms.partNumber
       JOIN material_plant_data mpd ON mpd.partNumber = ms.partNumber AND mpd.plant = ms.plant
       WHERE ms.partNumber = ? AND ms.plant = ?
         AND ms.deletedOn IS NULL AND mpd.deletedOn IS NULL
       LIMIT 1`,
      [k.partNumber, k.plant]
    );

    return rows[0] ? toRow(rows[0]) : null;
  },

  async create(input: CreateBarangInput, createdBy: string): Promise<KatalogBarangRow> {
    const { partNumber, plant } = normalizeKey(input.partNumber, input.plant);
    const by = (createdBy ?? "").trim() || "system";

    // ✅ guard non-negative (double safety)
    assertNonNegative("ROP", input.reorderPoint);
    assertNonNegative("Safety Stock", input.safetyStock);

    // 1) master: insert kalau belum ada, update kalau sudah ada
    const master = await dbQuery<{ partNumber: string }>(
      `SELECT partNumber FROM material_master WHERE partNumber = ? LIMIT 1`,
      [partNumber]
    );

    if (!master.length) {
      await dbQuery(
        `INSERT INTO material_master
           (partNumber, materialDescription, baseUnitOfMeasure, createdOn, createTime, createdBy, materialGroup)
         VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?)`,
        [
          partNumber,
          input.materialDescription.trim(),
          input.baseUnitOfMeasure.trim(),
          by,
          input.materialGroup ?? null,
        ]
      );
    } else {
      await dbQuery(
        `UPDATE material_master
         SET materialDescription = ?, baseUnitOfMeasure = ?, materialGroup = ?
         WHERE partNumber = ?`,
        [
          input.materialDescription.trim(),
          input.baseUnitOfMeasure.trim(),
          input.materialGroup ?? null,
          partNumber,
        ]
      );
    }

    // 2) plant_data: active -> reject, deleted -> revive, none -> insert
    const plantRow = await dbQuery<{ deletedOn: string | null }>(
      `SELECT deletedOn
       FROM material_plant_data
       WHERE partNumber = ? AND plant = ?
       LIMIT 1`,
      [partNumber, plant]
    );

    if (!plantRow.length) {
      await dbQuery(
        `INSERT INTO material_plant_data (partNumber, plant, reorderPoint, safetyStock, deletedOn)
         VALUES (?, ?, ?, ?, NULL)`,
        [partNumber, plant, input.reorderPoint, input.safetyStock]
      );
    } else if (plantRow[0].deletedOn === null) {
      throw new Error("Barang untuk cabang ini sudah ada");
    } else {
      await dbQuery(
        `UPDATE material_plant_data
         SET reorderPoint = ?, safetyStock = ?, deletedOn = NULL
         WHERE partNumber = ? AND plant = ?`,
        [input.reorderPoint, input.safetyStock, partNumber, plant]
      );
    }

    // 3) stock: deleted -> revive, none -> insert default 0
    const stockRow = await dbQuery<{ deletedOn: string | null }>(
      `SELECT deletedOn
       FROM material_stock
       WHERE partNumber = ? AND plant = ?
       LIMIT 1`,
      [partNumber, plant]
    );

    if (!stockRow.length) {
      await dbQuery(
        `INSERT INTO material_stock (partNumber, plant, freeStock, blocked, deletedOn)
         VALUES (?, ?, 0.000, 0.000, NULL)`,
        [partNumber, plant]
      );
    } else if (stockRow[0].deletedOn !== null) {
      await dbQuery(
        `UPDATE material_stock
         SET deletedOn = NULL
         WHERE partNumber = ? AND plant = ?`,
        [partNumber, plant]
      );
    }

    const created = await katalogBarangService.getByKey(partNumber, plant);
    if (!created) throw new Error("Gagal membuat katalog barang");
    return created;
  },

  async update(
    partNumber: string,
    plant: string,
    input: UpdateBarangInput
  ): Promise<KatalogBarangRow | null> {
    const k = normalizeKey(partNumber, plant);
    const existing = await katalogBarangService.getByKey(k.partNumber, k.plant);
    if (!existing) return null;

    // ✅ guard non-negative (double safety)
    assertNonNegative("ROP", input.reorderPoint);
    assertNonNegative("Safety Stock", input.safetyStock);

    // ====== 0) OPTIONAL: pindah plant (selain partNumber boleh diedit) ======
    const nextPlant = input.plant?.trim();
    let finalPlant = k.plant;

    if (nextPlant && nextPlant !== k.plant) {
      // Cegah konflik kalau target key sudah ada (aktif)
      const conflict = await dbQuery<{ partNumber: string }>(
        `SELECT ms.partNumber
         FROM material_stock ms
         JOIN material_plant_data mpd
           ON mpd.partNumber = ms.partNumber AND mpd.plant = ms.plant
         WHERE ms.partNumber = ? AND ms.plant = ?
           AND ms.deletedOn IS NULL AND mpd.deletedOn IS NULL
         LIMIT 1`,
        [k.partNumber, nextPlant]
      );
      if (conflict.length) {
        throw new Error("Tidak bisa pindah plant: barang di cabang target sudah ada");
      }

      // Pindahkan plant pada tabel terkait (idealnya TRANSACTION)
      await dbQuery(
        `UPDATE material_stock
         SET plant = ?
         WHERE partNumber = ? AND plant = ? AND deletedOn IS NULL`,
        [nextPlant, k.partNumber, k.plant]
      );

      await dbQuery(
        `UPDATE material_plant_data
         SET plant = ?
         WHERE partNumber = ? AND plant = ? AND deletedOn IS NULL`,
        [nextPlant, k.partNumber, k.plant]
      );

      finalPlant = nextPlant;
    }

    // ====== 1) update master ======
    if (
      input.materialDescription !== undefined ||
      input.baseUnitOfMeasure !== undefined ||
      input.materialGroup !== undefined
    ) {
      await dbQuery(
        `UPDATE material_master
         SET materialDescription = ?, baseUnitOfMeasure = ?, materialGroup = ?
         WHERE partNumber = ?`,
        [
          (input.materialDescription ?? existing.materialDescription).trim(),
          (input.baseUnitOfMeasure ?? existing.baseUnitOfMeasure).trim(),
          input.materialGroup ?? existing.materialGroup ?? null,
          k.partNumber,
        ]
      );
    }

    // ====== 2) update plant data (finalPlant dipakai kalau plant berubah) ======
    if (input.reorderPoint !== undefined || input.safetyStock !== undefined) {
      await dbQuery(
        `UPDATE material_plant_data
         SET reorderPoint = ?, safetyStock = ?
         WHERE partNumber = ? AND plant = ? AND deletedOn IS NULL`,
        [
          input.reorderPoint ?? existing.reorderPoint,
          input.safetyStock ?? existing.safetyStock,
          k.partNumber,
          finalPlant,
        ]
      );
    }

    return await katalogBarangService.getByKey(k.partNumber, finalPlant);
  },

  async remove(partNumber: string, plant: string): Promise<boolean> {
    const k = normalizeKey(partNumber, plant);

    const exists = await dbQuery<{ partNumber: string }>(
      `SELECT partNumber FROM material_stock
       WHERE partNumber = ? AND plant = ? AND deletedOn IS NULL
       LIMIT 1`,
      [k.partNumber, k.plant]
    );
    if (!exists.length) return false;

    await dbQuery(
      `UPDATE material_stock
       SET deletedOn = NOW()
       WHERE partNumber = ? AND plant = ? AND deletedOn IS NULL`,
      [k.partNumber, k.plant]
    );

    await dbQuery(
      `UPDATE material_plant_data
       SET deletedOn = NOW()
       WHERE partNumber = ? AND plant = ? AND deletedOn IS NULL`,
      [k.partNumber, k.plant]
    );

    return true;
  },
};
