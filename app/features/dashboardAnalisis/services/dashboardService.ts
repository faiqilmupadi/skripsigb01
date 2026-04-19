import { dbQuery } from "@/app/lib/db.server";
import { DashboardData, POStatusMonitor } from "../types";

export async function getDashboardData(start: string, end: string): Promise<DashboardData> {
  // 1. Aktivitas Admin (Jumlah Transaksi PO dan SO)
  const adminActivities = await dbQuery<any>(`
    SELECT 
      u.namaUser as userName,
      SUM(CASE WHEN m.movementType = 'POTP123' THEN 1 ELSE 0 END) as poCount,
      SUM(CASE WHEN m.movementType = 'SOTP123' THEN 1 ELSE 0 END) as soCount
    FROM users u
    JOIN movements m ON u.userId = m.userName
    WHERE m.postingDate BETWEEN ? AND ?
    GROUP BY u.userId
  `, [start, end]);

  // 2. Top 3 Barang Paling Ramai (Berdasarkan Volume Sales Order)
  const top3Barang = await dbQuery<any>(`
    SELECT namaBarang, kodeBarang, SUM(quantity) as totalTerjual
    FROM movements
    WHERE movementType = 'SOTP123' AND postingDate BETWEEN ? AND ?
    GROUP BY kodeBarang
    ORDER BY totalTerjual DESC
    LIMIT 3
  `, [start, end]);

  // 3. Barang Hilang & Rusak (KTP123=Hilang, RTP123/KTP124=Rusak)
  const lossDamage = await dbQuery<any>(`
    SELECT postingDate, namaBarang, quantity, eum, catatan,
           CASE WHEN movementType = 'KTP123' THEN 'Hilang' ELSE 'Rusak' END as tipe
    FROM movements
    WHERE movementType IN ('KTP123', 'KTP124', 'RTP123')
      AND postingDate BETWEEN ? AND ?
    ORDER BY postingDate DESC
  `, [start, end]);

  // 4. Barang Kena ROP (Bukan notif, filter stok <= ROP)
  const ropAlerts = await dbQuery<any>(`
    SELECT s.kodeBarang, s.namaBarang, s.barangSiap as stokSiap, r.rop as batasRop, s.eum
    FROM stokBarang s
    JOIN rop r ON s.kodeBarang = r.kodeBarang
    WHERE s.barangSiap <= r.rop
  `);

  return { adminActivities, top3Barang, lossDamage, ropAlerts };
}

export async function getPOByStatus(status: string): Promise<POStatusMonitor[]> {
  return await dbQuery<POStatusMonitor>(`
    SELECT nomorPurchaseOrder, namaBarang, qty, eum, status, namaVendor
    FROM purchaseOrder
    WHERE status = ?
    ORDER BY tanggal DESC
  `, [status]);
}