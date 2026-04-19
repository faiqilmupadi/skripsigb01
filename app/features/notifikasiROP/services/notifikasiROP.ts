import { dbQuery, dbExec } from "@/app/lib/db.server";
import { LowStockItem } from "../types";

export async function checkAndUpdateROP(): Promise<LowStockItem[]> {
  // 1. Ambil master data ROP dan Stok saat ini
  const items = await dbQuery<any>(`
    SELECT r.kodeBarang, r.namaBarang, r.leadtime, r.safetyStock, r.rop, s.barangSiap, s.eum
    FROM rop r
    JOIN stokBarang s ON r.kodeBarang = s.kodeBarang
  `);

  // 2. Hitung total barang keluar (SO) DAN hitung sudah berapa hari sejak penjualan pertama
  // Menghapus batasan 30 hari agar data bulan Februari tetap terbaca saat demo
  const usageData = await dbQuery<any>(`
    SELECT 
      kodeBarang, 
      SUM(quantity) as totalUsed,
      DATEDIFF(CURDATE(), MIN(postingDate)) as daysActive
    FROM movements
    WHERE movementType = 'SOTP123'
    GROUP BY kodeBarang
  `);

  const lowStockItems: LowStockItem[] = [];

  for (const item of items) {
    const usage = usageData.find((u: any) => u.kodeBarang === item.kodeBarang);
    
    let avgDailyUsage = 0;

    if (usage && usage.totalUsed > 0) {
      // Jika umur barang kurang dari 1 hari (baru diinput hari ini), kita anggap pembaginya 1 agar tidak error (Infinity)
      const days = usage.daysActive > 0 ? usage.daysActive : 1; 
      
      // Rata-rata penggunaan harian dinamis (Total Penggunaan / Total Hari Aktif)
      avgDailyUsage = usage.totalUsed / days;
    }

    // RUMUS ROP: (Rata-rata Harian * Lead Time) + Safety Stock
    const calculatedRop = Math.ceil((avgDailyUsage * item.leadtime) + item.safetyStock);

    // 3. Update nilai ROP di database jika ada perubahan seiring tren
    if (calculatedRop !== item.rop) {
      await dbExec(
        `UPDATE rop SET rop = ? WHERE kodeBarang = ?`,
        [calculatedRop, item.kodeBarang]
      );
    }

    // 4. Jika stok fisik (Barang Siap) <= Batas ROP, masukkan ke daftar peringatan
    if (item.barangSiap <= calculatedRop) {
      lowStockItems.push({
        kodeBarang: item.kodeBarang,
        namaBarang: item.namaBarang,
        barangSiap: item.barangSiap,
        rop: calculatedRop,
        eum: item.eum
      });
    }
  }

  return lowStockItems;
}