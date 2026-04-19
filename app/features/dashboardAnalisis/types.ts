export type AdminActivity = {
  userName: string;
  poCount: number;
  soCount: number;
};

export type POStatusMonitor = {
  nomorPurchaseOrder: string;
  namaBarang: string;
  qty: number;
  eum: string;
  status: string;
  namaVendor: string;
};

export type TopBarang = {
  kodeBarang: string;
  namaBarang: string;
  totalTerjual: number;
};

export type LossDamageData = {
  postingDate: string;
  namaBarang: string;
  quantity: number;
  eum: string;
  tipe: "Hilang" | "Rusak";
  catatan: string;
};

export type ROPStatus = {
  kodeBarang: string;
  namaBarang: string;
  stokSiap: number;
  batasRop: number;
  eum: string;
};

export type DashboardData = {
  adminActivities: AdminActivity[];
  top3Barang: TopBarang[];
  lossDamage: LossDamageData[];
  ropAlerts: ROPStatus[];
};