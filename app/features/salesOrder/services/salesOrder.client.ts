import { SalesOrderFormData, SalesOrderGroup, BarangOption, TransformEum } from "../types";

const BASE_URL = "/api/adminGudang/salesOrder";

export async function fetchSalesOrders(): Promise<{ data: SalesOrderGroup[], options: { barangList: BarangOption[], transformList: TransformEum[] } }> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Gagal mengambil data Sales Order");
  return res.json();
}

export async function addSalesOrder(data: SalesOrderFormData): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal memproses Sales Order");
  }
}