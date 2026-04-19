import { MovementData } from "../types";

export async function fetchRiwayatTransaksi(start: string, end: string): Promise<MovementData[]> {
  const res = await fetch(`/api/ownerGudang/riwayatTransaksi?start=${start}&end=${end}`);
  if (!res.ok) throw new Error("Gagal mengambil data riwayat transaksi");
  const json = await res.json();
  return json.data;
}