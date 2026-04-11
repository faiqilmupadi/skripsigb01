export type AdminKinerjaPoint = {
  date: string;
  [adminName: string]: number | string;
};

export type AdminKinerja = {
  topAdmins: string[];
  series: AdminKinerjaPoint[];
};

export type DashboardSummary = {
  totalTransaksi: number;
  totalBarangKeluar: number;
  totalBarangMasuk: number;
  totalBarangRetur: number;
};

export type DashboardAnalisisResponse =
  | {
      ok: true;
      start: string;
      end: string;
      summary: DashboardSummary;
      kinerja: AdminKinerja;
    }
  | { ok: false; message: string };