import { dbQuery, dbExec } from "@/app/lib/db.server";
import { POVendorGroup, VendorInfo, VendorUserOption } from "../types";

// 1. Tarik semua User yang punya Role "Vendor" untuk ditaruh di Dropdown Simulasi Login
export async function getAvailableVendorUsers(): Promise<VendorUserOption[]> {
  const rows = await dbQuery<VendorUserOption>(`
    SELECT u.userId, u.namaUser, v.namaVendor 
    FROM users u 
    JOIN vendor v ON u.userId = v.userId 
    WHERE u.roleUser = 'Vendor'
  `);
  return rows;
}

// 2. Cari info Vendor dari userId yang sedang login
export async function getVendorByUserId(userId: string): Promise<VendorInfo | null> {
  const rows = await dbQuery<any>(`
    SELECT v.kodeVendor, v.namaVendor, u.namaUser 
    FROM vendor v 
    JOIN users u ON v.userId = u.userId 
    WHERE v.userId = ?
  `, [userId]);
  return rows[0] || null;
}

// 3. Tarik PO yang KHUSUS milik vendor tersebut
export async function getVendorPOs(kodeVendor: string): Promise<POVendorGroup[]> {
  const rows = await dbQuery<any>(`
    SELECT * FROM purchaseOrder 
    WHERE kodeVendor = ? 
    ORDER BY tanggal DESC, nomorPurchaseOrder DESC
  `, [kodeVendor]);

  const grouped: Record<string, POVendorGroup> = {};

  for (const row of rows) {
    if (!grouped[row.nomorPurchaseOrder]) {
      grouped[row.nomorPurchaseOrder] = {
        nomorPurchaseOrder: row.nomorPurchaseOrder,
        tanggal: row.tanggal,
        status: row.status,
        catatan: row.catatan,
        totalSemuaHarga: 0,
        items: [],
      };
    }

    grouped[row.nomorPurchaseOrder].items.push({
      kodeBarang: row.kodeBarang,
      namaBarang: row.namaBarang,
      qty: row.qty,
      eum: row.eum,
      totalHarga: row.totalHarga || 0,
    });

    grouped[row.nomorPurchaseOrder].totalSemuaHarga += (row.totalHarga || 0);
  }

  return Object.values(grouped);
}

// 4. Update status PO
export async function updateVendorPOStatus(nomorPO: string, kodeVendor: string, newStatus: string) {
  await dbExec(
    `UPDATE purchaseOrder SET status = ? WHERE nomorPurchaseOrder = ? AND kodeVendor = ?`,
    [newStatus, nomorPO, kodeVendor]
  );
}