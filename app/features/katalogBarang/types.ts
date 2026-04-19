import { z } from "zod";

export type TransformRow = {
  qtyFrom: number;
  eumFrom: string;
  qtyTo: number;
  eumTo: string;
};

export type KatalogBarangRow = {
  kodeBarang: string;
  namaBarang: string;
  leadtime: number;
  safetyStock: number;
  volume: number | null;
  satuan: string | null;
  jenisBarang: string | null;
  baseOfMeasure: string | null;
  warna: string | null;
  allTransforms?: TransformRow[];
};

export type CreateBarangInput = {
  kodeBarang: string;
  namaBarang: string;
  leadtime: number;
  safetyStock: number;
  volume?: number | null;
  satuan?: string | null;
  jenisBarang?: string | null;
  baseOfMeasure?: string | null;
  warna?: string | null;
  transforms?: TransformRow[];
};

export type UpdateBarangInput = Partial<Omit<CreateBarangInput, "kodeBarang">>;

// ====== Zod helpers ======
const trimStr = (min: number, max: number, label = "Field") =>
  z.string().trim().min(min, { message: `${label} wajib diisi` }).max(max, { message: `${label} maksimal ${max} karakter` });

const nonNegNum = (label: string) =>
  z.coerce.number().finite({ message: `${label} harus angka valid` }).min(0, { message: `${label} tidak boleh negatif` });

const TransformSchema = z.object({
  qtyFrom: z.coerce.number().min(0),
  eumFrom: z.string().trim().min(1),
  qtyTo: z.coerce.number().min(0),
  eumTo: z.string().trim().min(1),
});

// 2. Gunakan di dalam CreateBarangSchema
export const CreateBarangSchema = z.object({
  kodeBarang: z.string().trim().min(1, "Kode wajib diisi"),
  namaBarang: z.string().trim().min(1, "Nama wajib diisi"),
  leadtime: z.coerce.number().min(0),
  safetyStock: z.coerce.number().min(0),
  baseOfMeasure: z.string().trim().min(1, "Satuan dasar wajib diisi"),
  warna: z.string().optional().nullable(),
  // INI KUNCINYA: transforms harus array
  transforms: z.array(TransformSchema).optional(), 
});