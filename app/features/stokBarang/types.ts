export type StokBarang = {
  kodeBarang: string;
  namaBarang: string;
  barangSiap: number;
  barangHilang: number;
  barangRusak: number;
  warna: string;
  eum: string;
};

export type AdjustmentType = "Hilang" | "Rusak" | "Ketemu";

export type StockAdjustmentPayload = {
  kodeBarang: string;
  tipe: AdjustmentType;
  qty: number;
  catatan: string;
};