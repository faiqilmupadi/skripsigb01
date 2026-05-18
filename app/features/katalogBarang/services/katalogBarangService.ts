import { dbQuery } from "@/app/lib/db.server";
import type { KatalogBarangRow } from "@/app/features/katalogBarang/types";

export const katalogBarangService = {
  async getColors(): Promise<{ kodeWarna: string; namaWarna: string }[]> {
    return await dbQuery<any>(`SELECT kodeWarna, namaWarna FROM warna ORDER BY namaWarna ASC`);
  },

  async list(): Promise<KatalogBarangRow[]> {
    // JOIN ditambahkan agar saat list ditarik, hargaBarang juga terambil
    const items = await dbQuery<any>(
      `SELECT 
         b.kodeBarang, b.namaBarang, b.volume, b.satuan, b.jenisBarang, b.baseOfMeasure, b.warna,
         COALESCE(r.leadtime, 0) as leadtime, COALESCE(r.safetyStock, 0) as safetyStock,
         COALESCE(hj.hargaBarang, 0) as hargaBarang
       FROM barang b
       LEFT JOIN rop r ON b.kodeBarang = r.kodeBarang
       LEFT JOIN hargajual hj ON b.kodeBarang = hj.kodeBarang
       ORDER BY b.kodeBarang ASC`
    );

    const allTransforms = await dbQuery<any>(`SELECT * FROM transformEum`);

    return items.map((item: any) => ({
      ...item,
      allTransforms: allTransforms.filter((t: any) => t.kodeBarang === item.kodeBarang),
    }));
  },

  async create(input: any): Promise<KatalogBarangRow> {
    const { kodeBarang, transforms } = input;

    const existingBarang = await dbQuery<any>(`SELECT kodeBarang FROM barang WHERE kodeBarang = ?`, [kodeBarang]);
    if (existingBarang.length > 0) throw new Error("Kode Barang ini sudah terdaftar di sistem.");

    await dbQuery(
      `INSERT INTO barang (kodeBarang, namaBarang, baseOfMeasure, warna) VALUES (?, ?, ?, ?)`,
      [kodeBarang, input.namaBarang, input.baseOfMeasure, input.warna]
    );
    

    await dbQuery(
      `INSERT INTO rop (kodeBarang, namaBarang, leadtime, safetyStock, eum) VALUES (?, ?, ?, ?, ?)`,
      [kodeBarang, input.namaBarang, input.leadtime, input.safetyStock, input.baseOfMeasure]
    );

    // INSERT data ke table hargajual
    await dbQuery(
      `INSERT INTO hargajual (kodeBarang, namaBarang, hargaBarang, eum) VALUES (?, ?, ?, ?)`,
      [kodeBarang, input.namaBarang, input.hargaBarang || 0, input.baseOfMeasure]
    );

    if (transforms && transforms.length > 0) {
      for (const t of transforms) {
        await dbQuery(
          `INSERT INTO transformEum (kodeBarang, qtyFrom, eumFrom, qtyTo, eumTo) VALUES (?, ?, ?, ?, ?)`,
          [kodeBarang, t.qtyFrom, t.eumFrom, t.qtyTo, t.eumTo]
        );
      }
    }

    const res = await this.list();
    return res.find(r => r.kodeBarang === kodeBarang)!;
  },

  async update(kodeBarang: string, input: any): Promise<boolean> {
    await dbQuery(
      `UPDATE barang SET namaBarang = ?, baseOfMeasure = ?, warna = ? WHERE kodeBarang = ?`,
      [input.namaBarang, input.baseOfMeasure, input.warna, kodeBarang]
    );

    // Update ROP
    await dbQuery(`DELETE FROM rop WHERE kodeBarang = ?`, [kodeBarang]);
    await dbQuery(
      `INSERT INTO rop (kodeBarang, namaBarang, leadtime, safetyStock, eum) VALUES (?, ?, ?, ?, ?)`,
      [kodeBarang, input.namaBarang, input.leadtime, input.safetyStock, input.baseOfMeasure]
    );

    // Update Harga Jual (Delete lalu Insert agar lebih aman dari data yang tidak ada / baru ditambahkan)
    await dbQuery(`DELETE FROM hargajual WHERE kodeBarang = ?`, [kodeBarang]);
    await dbQuery(
      `INSERT INTO hargajual (kodeBarang, namaBarang, hargaBarang, eum) VALUES (?, ?, ?, ?)`,
      [kodeBarang, input.namaBarang, input.hargaBarang || 0, input.baseOfMeasure]
    );

    if (input.transforms && Array.isArray(input.transforms)) {
      await dbQuery(`DELETE FROM transformEum WHERE kodeBarang = ?`, [kodeBarang]);
      for (const t of input.transforms) {
        await dbQuery(
          `INSERT INTO transformEum (kodeBarang, qtyFrom, eumFrom, qtyTo, eumTo) VALUES (?, ?, ?, ?, ?)`,
          [kodeBarang, t.qtyFrom, t.eumFrom, t.qtyTo, t.eumTo]
        );
      }
    }

    return true; 
  },

  async remove(kodeBarang: string): Promise<boolean> {
    await dbQuery(`DELETE FROM transformEum WHERE kodeBarang = ?`, [kodeBarang]);
    await dbQuery(`DELETE FROM rop WHERE kodeBarang = ?`, [kodeBarang]);
    await dbQuery(`DELETE FROM stokBarang WHERE kodeBarang = ?`, [kodeBarang]);
    await dbQuery(`DELETE FROM hargajual WHERE kodeBarang = ?`, [kodeBarang]);
    await dbQuery(`DELETE FROM vendorList WHERE kodeBarang = ?`, [kodeBarang]);
    await dbQuery(`DELETE FROM barang WHERE kodeBarang = ?`, [kodeBarang]);
    return true;
  },
};