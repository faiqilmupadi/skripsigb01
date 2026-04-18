import { dbQuery, dbExec } from "@/app/lib/db.server";
import { SalesOrderGroup, SalesOrderItem, BarangOption } from "../types";

export async function getSalesOrdersGrouped(): Promise<SalesOrderGroup[]> {
  const rows = await dbQuery<any>(`
    SELECT so.*, u.namaUser AS namaAdmin 
    FROM salesOrder so
    LEFT JOIN users u ON so.userId = u.userId
    ORDER BY so.tanggal DESC, so.nomorSalesOrder DESC
  `);

  const grouped: Record<string, SalesOrderGroup> = {};

  for (const row of rows) {
    if (!grouped[row.nomorSalesOrder]) {
      grouped[row.nomorSalesOrder] = {
        nomorSalesOrder: row.nomorSalesOrder,
        tanggal: row.tanggal,
        penanggungJawab: row.namaAdmin || row.userId || "-", 
        totalSemuaHarga: 0,
        items: [],
      };
    }
    
    const hargaSatuan = row.qty > 0 && row.totalHarga ? row.totalHarga / row.qty : 0;

    grouped[row.nomorSalesOrder].items.push({
      kodeBarang: row.kodeBarang,
      namaBarang: row.namaBarang,
      qty: row.qty,
      eum: row.eum,
      hargaSatuan: hargaSatuan,
      totalHarga: row.totalHarga || 0,
    });

    grouped[row.nomorSalesOrder].totalSemuaHarga += (row.totalHarga || 0);
  }

  return Object.values(grouped);
}

export async function getSOOptions() {
  const barangList = await dbQuery<BarangOption>(`
    SELECT s.kodeBarang, s.namaBarang, s.barangSiap, s.eum AS baseEum, COALESCE(h.hargaBarang, 0) as hargaJual, COALESCE(h.eum, s.eum) AS hargaEum
    FROM stokBarang s
    LEFT JOIN hargaJual h ON s.kodeBarang = h.kodeBarang
    WHERE s.barangSiap > 0
    ORDER BY s.namaBarang ASC
  `);
  
  const transformList = await dbQuery<any>(`SELECT * FROM transformEum`);
  
  return { barangList, transformList };
}

export async function createSalesOrder(data: { userId: string, items: SalesOrderItem[] }) {
  const rules = await dbQuery<any>(`SELECT * FROM transformEum`);
  
  for (const item of data.items) {
    const checkStock = await dbQuery<any>(`SELECT barangSiap, eum FROM stokBarang WHERE kodeBarang = ?`, [item.kodeBarang]);
    if (checkStock.length === 0) throw new Error(`Barang ${item.kodeBarang} tidak ada di gudang.`);

    const stokTersedia = checkStock[0].barangSiap;
    const baseEum = checkStock[0].eum;
    let qtyDalamBase = item.qty;

    if (item.eum.toLowerCase() !== baseEum.toLowerCase()) {
      const itemRules = rules.filter((r: any) => r.kodeBarang === item.kodeBarang);
      let currentEum = item.eum;
      let maxLoop = 5;

      while (currentEum.toLowerCase() !== baseEum.toLowerCase() && maxLoop > 0) {
        const rule = itemRules.find((r: any) => r.eumFrom.toLowerCase() === currentEum.toLowerCase());
        if (!rule) break; 
        qtyDalamBase = (qtyDalamBase / rule.qtyFrom) * rule.qtyTo;
        currentEum = rule.eumTo;
        maxLoop--;
      }
    }

    if (stokTersedia < qtyDalamBase) {
      throw new Error(`Stok ${item.namaBarang} tidak cukup. Butuh ${qtyDalamBase} ${baseEum}, Sisa ${stokTersedia} ${baseEum}.`);
    }
    
    (item as any)._calculatedBaseQty = qtyDalamBase; 
    (item as any)._baseEum = baseEum;
  }

  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomStr = Math.floor(100 + Math.random() * 900);
  const nomorSO = `SO-${dateStr}-${randomStr}`;
  const tanggalHariIni = new Date().toISOString().slice(0, 10);
  const movementType = "SOTP123"; 

  for (const item of data.items) {
    const baseQtyToDeduct = (item as any)._calculatedBaseQty; 
    const baseEum = (item as any)._baseEum;

    // A. Insert SO (Sesuai nota, misal: 2 Dus)
    await dbExec(
      `INSERT INTO salesOrder (nomorSalesOrder, kodeBarang, namaBarang, qty, eum, totalHarga, userId, tanggal) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nomorSO, item.kodeBarang, item.namaBarang, item.qty, item.eum, item.totalHarga, data.userId, tanggalHariIni]
    );

    const detailBarang = await dbQuery<any>(`SELECT warna, volume FROM barang WHERE kodeBarang = ?`, [item.kodeBarang]);
    const warna = detailBarang[0]?.warna || "-";
    const volume = detailBarang[0]?.volume || null;

    // B. Insert Movements (Fisik asli yang dipotong di Gudang, misal: 200 Pcs)
    await dbExec(
      `INSERT INTO movements (movementType, nomorSalesOrder, kodeBarang, namaBarang, warna, volume, quantity, eum, totalHarga, catatan, userName, postingDate) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [movementType, nomorSO, item.kodeBarang, item.namaBarang, warna, volume, baseQtyToDeduct, baseEum, item.totalHarga, "Pengeluaran Sales Order", data.userId, tanggalHariIni]
    );

    // C. Potong Stok Gudang
    await dbExec(
      `UPDATE stokBarang SET barangSiap = barangSiap - ? WHERE kodeBarang = ?`,
      [baseQtyToDeduct, item.kodeBarang]
    );
  }
}