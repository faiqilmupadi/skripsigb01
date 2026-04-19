export type MovementData = {
  movementId?: number;
  movementType: string;
  nomorPurchaseOrder?: string | null;
  nomorSalesOrder?: string | null;
  kodeBarang: string;
  namaBarang: string;
  quantity: number;
  eum: string;
  totalHarga: number; // Pastikan ini ada
  catatan: string | null;
  userName: string;      // Ini ID
  namaUser?: string;     // Ini Nama Lengkap (hasil JOIN)
  postingDate: string;
  status: string | null; // Kolom status yang baru kita buat
};