export type UserAkun = {
  userId: string;
  username: string;
  password?: string; 
  email: string | null;
  namaUser: string;
  roleUser: string;
};

export type VendorData = {
  kodeVendor: string;
  namaVendor: string;
  alamat: string | null;
  userId: string | null; // FK ke tabel users
};

export type TabType = "admin" | "vendor";