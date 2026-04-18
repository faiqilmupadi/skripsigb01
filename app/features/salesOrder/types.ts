export type SalesOrderItem = {
  kodeBarang: string;
  namaBarang: string;
  qty: number;
  eum: string;
  hargaSatuan: number;
  totalHarga: number;
};

export type SalesOrderGroup = {
  nomorSalesOrder: string;
  tanggal: string;
  penanggungJawab: string;
  totalSemuaHarga: number;
  items: SalesOrderItem[];
};

export type SalesOrderFormData = {
  items: SalesOrderItem[];
};

export type BarangOption = {
  kodeBarang: string;
  namaBarang: string;
  barangSiap: number;
  baseEum: string;
  hargaJual: number;
  hargaEum: string;
};

export type TransformEum = {
  kodeBarang: string;
  qtyFrom: number;
  eumFrom: string;
  qtyTo: number;
  eumTo: string;
};