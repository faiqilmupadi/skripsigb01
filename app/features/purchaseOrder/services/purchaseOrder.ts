import { dbQuery, dbExec } from "@/app/lib/db.server";
import { PurchaseOrderGroup, PurchaseOrderItem, VendorOption, VendorListOption } from "../types";

export async function getPurchaseOrdersGrouped(): Promise<PurchaseOrderGroup[]> {
  const rows = await dbQuery<any>(`
    SELECT po.*, po.userId AS adminId, u.namaUser AS namaAdmin 
    FROM purchaseOrder po
    LEFT JOIN users u ON po.userId = u.userId
    ORDER BY po.tanggal DESC, po.nomorPurchaseOrder DESC
  `);

  const allTransforms = await dbQuery<any>(`SELECT * FROM transformEum`);
  const allStoks = await dbQuery<any>(`SELECT kodeBarang, eum FROM stokBarang`);

  const grouped: Record<string, PurchaseOrderGroup> = {};

  for (const row of rows) {
    if (!grouped[row.nomorPurchaseOrder]) {
      grouped[row.nomorPurchaseOrder] = {
        nomorPurchaseOrder: row.nomorPurchaseOrder,
        kodeVendor: row.kodeVendor,
        namaVendor: row.namaVendor,
        tanggal: row.tanggal,
        status: row.status,
        catatan: row.catatan,
        penanggungJawab: row.namaAdmin || row.adminId || "-", 
        totalSemuaHarga: 0,
        items: [],
      };
    }
    
    const hargaSatuan = row.qty > 0 && row.totalHarga ? row.totalHarga / row.qty : 0;

    const targetEum = allStoks.find(s => s.kodeBarang === row.kodeBarang)?.eum || row.eum;
    const rules = allTransforms.filter(t => t.kodeBarang === row.kodeBarang);

    let currentQty = row.qty;
    let currentEum = row.eum;
    let maxLoop = 5;

    while (currentEum.toLowerCase() !== targetEum.toLowerCase() && maxLoop > 0) {
      const rule = rules.find((r: any) => r.eumFrom.toLowerCase() === currentEum.toLowerCase());
      if (!rule) break; 
      currentQty = (currentQty / rule.qtyFrom) * rule.qtyTo;
      currentEum = rule.eumTo;
      maxLoop--;
    }
    
    const conversionFactor = row.qty > 0 ? currentQty / row.qty : 1;

    grouped[row.nomorPurchaseOrder].items.push({
      kodeBarang: row.kodeBarang,
      namaBarang: row.namaBarang,
      qty: row.qty,
      eum: row.eum,
      baseQty: currentQty,
      baseEum: currentEum,
      conversionFactor: conversionFactor,
      hargaSatuan: hargaSatuan,
      totalHarga: row.totalHarga || 0,
    });

    grouped[row.nomorPurchaseOrder].totalSemuaHarga += (row.totalHarga || 0);
  }

  return Object.values(grouped);
}

export async function getPOOptions() {
  const vendors = await dbQuery<VendorOption>(`SELECT kodeVendor, namaVendor FROM vendor ORDER BY namaVendor ASC`);
  const vendorLists = await dbQuery<VendorListOption>(`SELECT kodeVendor, kodeBarang, namaBarang, hargaDariVendor, eum FROM vendorList`);
  return { vendors, vendorLists };
}

export async function createPurchaseOrder(data: { kodeVendor: string, namaVendor: string, userId: string, items: PurchaseOrderItem[] }) {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomStr = Math.floor(100 + Math.random() * 900);
  const nomorPO = `PO-${dateStr}-${randomStr}`;
  const tanggalHariIni = new Date().toISOString().slice(0, 10);
  const status = "Sudah Dipesan"; 
  const catatanAwal = "-"; 

  for (const item of data.items) {
    await dbExec(
      `INSERT INTO purchaseOrder (nomorPurchaseOrder, kodeBarang, kodeVendor, namaBarang, namaVendor, qty, eum, status, totalHarga, catatan, tanggal, userId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nomorPO, item.kodeBarang, data.kodeVendor, item.namaBarang, data.namaVendor, item.qty, item.eum, status, item.totalHarga, catatanAwal, tanggalHariIni, data.userId]
    );
  }
}

export async function receivePurchaseOrder(
  nomorPO: string, 
  catatan: string, 
  userId: string, 
  itemsReceived: { kodeBarang: string, qtyDiterima: number, eum: string, conversionFactor: number }[]
) {
  const items = await dbQuery<any>(`SELECT * FROM purchaseOrder WHERE nomorPurchaseOrder = ?`, [nomorPO]);
  if (items.length === 0) throw new Error("Purchase Order tidak ditemukan.");

  const catatanFinal = catatan || "-";

  await dbExec(
    `UPDATE purchaseOrder SET status = 'Selesai', catatan = ? WHERE nomorPurchaseOrder = ?`,
    [catatanFinal, nomorPO]
  );

  const tanggalHariIni = new Date().toISOString().slice(0, 10);
  const movementType = 'POTP123'; 

  for (const item of items) {
    const receivedData = itemsReceived.find(ir => ir.kodeBarang === item.kodeBarang);
    if (!receivedData) continue;

    const qtyAktualBase = receivedData.qtyDiterima;

    if (qtyAktualBase > 0) {
      const detailBarang = await dbQuery<any>(`SELECT warna, volume FROM barang WHERE kodeBarang = ?`, [item.kodeBarang]);
      const warna = detailBarang[0]?.warna || "-";
      const volume = detailBarang[0]?.volume || null;

      const hargaSatuanAsli = item.totalHarga / item.qty;
      const hargaSatuanBase = hargaSatuanAsli / receivedData.conversionFactor;
      const totalHargaAktual = hargaSatuanBase * qtyAktualBase;

      // [REVISI] Menambahkan kolom catatan di tabel movements
      await dbExec(
        `INSERT INTO movements (movementType, nomorPurchaseOrder, kodeBarang, namaBarang, warna, volume, quantity, eum, totalHarga, catatan, userName, postingDate) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [movementType, nomorPO, item.kodeBarang, item.namaBarang, warna, volume, qtyAktualBase, receivedData.eum, totalHargaAktual, catatanFinal, userId, tanggalHariIni]
      );

      await dbExec(
        `UPDATE stokBarang SET barangSiap = barangSiap + ? WHERE kodeBarang = ?`,
        [qtyAktualBase, item.kodeBarang]
      );
    }
  }
}