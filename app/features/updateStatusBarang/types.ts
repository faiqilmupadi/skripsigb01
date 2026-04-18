export type POItemVendor = {
  kodeBarang: string;
  namaBarang: string;
  qty: number;
  eum: string;
  totalHarga: number;
};

export type POVendorGroup = {
  nomorPurchaseOrder: string;
  tanggal: string;
  status: string;
  catatan: string | null;
  totalSemuaHarga: number;
  items: POItemVendor[];
};

export type VendorInfo = {
  kodeVendor: string;
  namaVendor: string;
  namaUser: string; // Menampung nama asli dari tabel users
};

export type VendorUserOption = {
  userId: string;
  namaUser: string;
  namaVendor: string;
};