import { StokBarang, StockAdjustmentPayload } from "../types";

const BASE_URL = "/api/adminGudang/stokBarang";

export async function fetchStokBarang(): Promise<{ data: StokBarang[] }> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Gagal mengambil data stok barang");
  return res.json();
}

export async function submitStockAdjustment(data: StockAdjustmentPayload): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal menyesuaikan stok");
  }
}