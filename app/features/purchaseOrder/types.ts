export type POStatus = "Sudah Dipesan" | "Sedang Dikemas" | "Sedang Dalam Pengiriman" | "Selesai";

export type PurchaseOrderItem = {
  kodeBarang: string;
  namaBarang: string;
  qty: number;
  eum: string;
  // Tambahan untuk konversi dinamis ke satuan terkecil (Pcs)
  baseQty: number;
  baseEum: string;
  conversionFactor: number;
  
  hargaSatuan: number;
  totalHarga: number;
};

export type PurchaseOrderGroup = {
  nomorPurchaseOrder: string;
  kodeVendor: string;
  namaVendor: string;
  tanggal: string;
  status: POStatus | string;
  catatan: string | null;
  penanggungJawab: string;
  totalSemuaHarga: number;
  items: PurchaseOrderItem[];
};

export type PurchaseOrderFormData = {
  kodeVendor: string;
  namaVendor: string;
  items: PurchaseOrderItem[];
};

export type VendorOption = {
  kodeVendor: string;
  namaVendor: string;
};

export type VendorListOption = {
  kodeVendor: string;
  kodeBarang: string;
  namaBarang: string;
  hargaDariVendor: number;
  eum: string;
};