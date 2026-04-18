export type Vendor = {
  kodeVendor: string;
  namaVendor: string;
  alamat: string;
};

export type VendorList = {
  vendorListId?: number; // Opsional di frontend
  kodeVendor: string;
  namaVendor: string;
  kodeBarang: string;
  namaBarang: string;
  warnaBarang: string;
  hargaDariVendor: number;
  eum: string;
};

export type VendorFormData = {
  kodeVendor: string;
  namaVendor: string;
  alamat: string;
};

export type VendorListFormData = {
  kodeVendor: string;
  namaVendor: string;
  kodeBarang: string;
  namaBarang: string;
  warnaBarang: string;
  hargaDariVendor: number | "";
  eum: string;
};

// Tambahan untuk menampung opsi Barang dari DB
export type BarangOption = {
  kodeBarang: string;
  namaBarang: string;
  warna: string;
};

export type ActiveTab = "vendor" | "vendorList";