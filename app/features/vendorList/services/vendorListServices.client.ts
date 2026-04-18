import { Vendor, VendorFormData, VendorList, VendorListFormData, BarangOption } from "../types";

const BASE_VENDOR = "/api/adminGudang/vendor";
const BASE_VENDOR_LIST = "/api/adminGudang/vendorList";

// ─── VENDOR ────────────────────────────────────────────────────────────────────

export async function fetchVendors(): Promise<Vendor[]> {
  const res = await fetch(BASE_VENDOR);
  if (!res.ok) throw new Error("Gagal mengambil data vendor");
  return res.json();
}

export async function addVendor(data: VendorFormData): Promise<void> {
  const res = await fetch(BASE_VENDOR, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal menambah vendor");
  }
}

export async function editVendor(kodeVendor: string, data: Omit<VendorFormData, "kodeVendor">): Promise<void> {
  const res = await fetch(`${BASE_VENDOR}/${kodeVendor}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal mengubah vendor");
  }
}

export async function removeVendor(kodeVendor: string): Promise<void> {
  const res = await fetch(`${BASE_VENDOR}/${kodeVendor}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal menghapus vendor");
  }
}

// ─── VENDOR LIST ───────────────────────────────────────────────────────────────

export async function fetchVendorList(): Promise<{ data: VendorList[], barangOptions: BarangOption[] }> {
  const res = await fetch(BASE_VENDOR_LIST);
  if (!res.ok) throw new Error("Gagal mengambil data vendor list");
  return res.json();
}

export async function addVendorList(data: VendorListFormData): Promise<void> {
  const res = await fetch(BASE_VENDOR_LIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal menambah vendor list");
  }
}

export async function editVendorList(kodeVendor: string, kodeBarang: string, data: Partial<VendorListFormData>): Promise<void> {
  const res = await fetch(`${BASE_VENDOR_LIST}/${kodeVendor}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kodeBarang, ...data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal mengubah vendor list");
  }
}

export async function removeVendorList(kodeVendor: string, kodeBarang: string): Promise<void> {
  const res = await fetch(
    `${BASE_VENDOR_LIST}/${kodeVendor}?kodeBarang=${encodeURIComponent(kodeBarang)}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal menghapus vendor list");
  }
}