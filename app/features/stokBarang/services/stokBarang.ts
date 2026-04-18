import { dbQuery, dbExec } from "@/app/lib/db.server";
import { StokBarang, StockAdjustmentPayload } from "../types";

export async function getAllStok(): Promise<StokBarang[]> {
  return await dbQuery<StokBarang>(`SELECT * FROM stokBarang ORDER BY kodeBarang ASC`);
}

export async function adjustStokBarang(payload: StockAdjustmentPayload, userId: string) {
  // 1. Tarik data stok barang saat ini
  const stokCurrent = await dbQuery<any>(`SELECT * FROM stokBarang WHERE kodeBarang = ?`, [payload.kodeBarang]);
  if (stokCurrent.length === 0) throw new Error("Barang tidak ditemukan di gudang.");
  const stok = stokCurrent[0];

  const qty = Number(payload.qty);
  if (qty <= 0) throw new Error("Kuantitas harus lebih dari 0.");

  let movementType = "";
  
  // 2. Validasi dan tentukan Arah Update & Movement Type
  if (payload.tipe === "Hilang") {
    if (qty > stok.barangSiap) throw new Error(`Maksimal barang hilang adalah ${stok.barangSiap} (Sesuai Barang Siap).`);
    movementType = 'KTP123'; // Barang Keluar Karena Hilang
    await dbExec(`UPDATE stokBarang SET barangSiap = barangSiap - ?, barangHilang = barangHilang + ? WHERE kodeBarang = ?`, [qty, qty, payload.kodeBarang]);
  } 
  else if (payload.tipe === "Rusak") {
    if (qty > stok.barangSiap) throw new Error(`Maksimal barang rusak adalah ${stok.barangSiap} (Sesuai Barang Siap).`);
    movementType = 'RTP124'; // Barang Keluar Karena Rusak (Master Data Baru)
    await dbExec(`UPDATE stokBarang SET barangSiap = barangSiap - ?, barangRusak = barangRusak + ? WHERE kodeBarang = ?`, [qty, qty, payload.kodeBarang]);
  } 
  else if (payload.tipe === "Ketemu") {
    if (qty > stok.barangHilang) throw new Error(`Maksimal barang ketemu adalah ${stok.barangHilang} (Sesuai saldo Barang Hilang).`);
    movementType = 'MTP123'; // Barang Masuk Karena Ketemu
    await dbExec(`UPDATE stokBarang SET barangSiap = barangSiap + ?, barangHilang = barangHilang - ? WHERE kodeBarang = ?`, [qty, qty, payload.kodeBarang]);
  } 
  else {
    throw new Error("Tipe penyesuaian tidak valid.");
  }

  // 3. Catat ke tabel Movements (Jejak Audit Historis)
  const detailBarang = await dbQuery<any>(`SELECT volume FROM barang WHERE kodeBarang = ?`, [payload.kodeBarang]);
  const volume = detailBarang[0]?.volume || null;
  const tanggalHariIni = new Date().toISOString().slice(0, 10);

  await dbExec(
    `INSERT INTO movements (movementType, nomorPurchaseOrder, nomorSalesOrder, kodeBarang, namaBarang, warna, volume, quantity, eum, totalHarga, catatan, userName, postingDate) 
     VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [movementType, payload.kodeBarang, stok.namaBarang, stok.warna, volume, qty, stok.eum, payload.catatan || "-", userId, tanggalHariIni]
  );
}