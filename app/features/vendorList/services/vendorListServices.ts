import { dbQuery, dbExec } from "@/app/lib/db.server";
import { Vendor, VendorFormData, VendorList, VendorListFormData, BarangOption } from "../types";

// ─── VENDOR (TABEL UTAMA) ──────────────────────────────────────────────────────

export async function getAllVendors(): Promise<Vendor[]> {
  const rows = await dbQuery<Vendor>(`
    SELECT kodeVendor, namaVendor, alamat
    FROM vendor ORDER BY namaVendor ASC
  `);
  return rows;
}

export async function createVendor(data: VendorFormData): Promise<void> {
  await dbExec(
    `INSERT INTO vendor (kodeVendor, namaVendor, alamat) VALUES (?, ?, ?)`,
    [data.kodeVendor, data.namaVendor, data.alamat]
  );
}

export async function updateVendor(kodeVendor: string, data: Omit<VendorFormData, "kodeVendor">): Promise<void> {
  await dbExec(
    `UPDATE vendor SET namaVendor = ?, alamat = ? WHERE kodeVendor = ?`,
    [data.namaVendor, data.alamat, kodeVendor]
  );
}

export async function deleteVendor(kodeVendor: string): Promise<void> {
  await dbExec(`DELETE FROM vendor WHERE kodeVendor = ?`, [kodeVendor]);
}

// ─── DATA BARANG UNTUK AUTOFILL ────────────────────────────────────────────────

export async function getBarangOptions(): Promise<BarangOption[]> {
  const rows = await dbQuery<BarangOption>(`
    SELECT kodeBarang, namaBarang, warna 
    FROM barang ORDER BY namaBarang ASC
  `);
  return rows;
}

// ─── VENDOR LIST (PEMETAAN BARANG) ─────────────────────────────────────────────

export async function getAllVendorList(): Promise<VendorList[]> {
  const rows = await dbQuery<VendorList>(`
    SELECT
      vl.vendorListId,
      vl.kodeVendor,
      v.namaVendor,
      vl.kodeBarang,
      vl.namaBarang,
      vl.warnaBarang,
      vl.hargaDariVendor,
      vl.eum
    FROM vendorList vl
    LEFT JOIN vendor v ON v.kodeVendor = vl.kodeVendor
    ORDER BY vl.vendorListId DESC
  `);
  return rows;
}

export async function createVendorList(data: VendorListFormData): Promise<void> {
  await dbExec(
    `INSERT INTO vendorList (kodeVendor, namaVendor, kodeBarang, namaBarang, warnaBarang, hargaDariVendor, eum) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.kodeVendor, data.namaVendor, data.kodeBarang, data.namaBarang, data.warnaBarang, data.hargaDariVendor, data.eum]
  );
}

export async function updateVendorList(kodeVendor: string, kodeBarang: string, data: Partial<VendorListFormData>): Promise<void> {
  await dbExec(
    `UPDATE vendorList SET hargaDariVendor = ?, eum = ? WHERE kodeVendor = ? AND kodeBarang = ?`,
    [data.hargaDariVendor, data.eum, kodeVendor, kodeBarang]
  );
}

export async function deleteVendorList(kodeVendor: string, kodeBarang: string): Promise<void> {
  await dbExec(
    `DELETE FROM vendorList WHERE kodeVendor = ? AND kodeBarang = ?`,
    [kodeVendor, kodeBarang]
  );
}