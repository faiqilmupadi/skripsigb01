import { PurchaseOrderFormData, PurchaseOrderGroup, VendorListOption, VendorOption, TransformEum } from "../types";

const BASE_URL = "/api/adminGudang/purchaseOrder";

export async function fetchPurchaseOrders(): Promise<{ data: PurchaseOrderGroup[], options: { vendors: VendorOption[], vendorLists: VendorListOption[], transformList: TransformEum[] } }> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Gagal mengambil data Purchase Order");
  return res.json();
}

export async function addPurchaseOrder(data: PurchaseOrderFormData): Promise<void> {
  const res = await fetch(BASE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal membuat Purchase Order");
  }
}

export async function submitReceivePO(nomorPO: string, catatan: string, itemsReceived: {kodeBarang: string, qtyDiterima: number, eum: string, conversionFactor: number}[]): Promise<void> {
  const res = await fetch(BASE_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nomorPO, catatan, itemsReceived }) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal menerima barang");
  }
}