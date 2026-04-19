import { LowStockItem } from "../types";

export async function fetchNotifikasiROP(): Promise<{ data: LowStockItem[] }> {
  const res = await fetch("/api/adminGudang/notifikasiROP");
  if (!res.ok) throw new Error("Gagal mengambil notifikasi ROP");
  return res.json();
}