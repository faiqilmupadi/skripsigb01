export type Vendor = {
  kodeVendor: string;
  namaVendor: string;
  alamat: string;
};

export type VendorList = {
  kodeVendor: string;
  namaVendor: string;
  kodeBarang: string;
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
  eum: string;
};

export type ActiveTab = "vendor" | "vendorList";