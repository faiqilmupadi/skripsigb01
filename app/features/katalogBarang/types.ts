// app/features/katalogBarang/types.ts
import { z } from "zod";

export type KatalogBarangRow = {
  partNumber: string;
  plant: string;
  freeStock: number; // dari material_stock
  materialDescription: string;
  baseUnitOfMeasure: string;
  reorderPoint: number; // dari material_plant_data
  safetyStock: number; // dari material_plant_data
  materialGroup: string | null;
  createdBy: string | null;
  createdOn: string; // ISO
};

export type CreateBarangInput = {
  partNumber: string;
  plant: string;
  materialDescription: string;
  baseUnitOfMeasure: string;
  reorderPoint: number;
  safetyStock: number;
  materialGroup?: string | null;
};

/**
 * ✅ Sesuai request:
 * - partNumber tidak bisa diedit
 * - semua selain partNumber boleh diedit (termasuk plant)
 */
export type UpdateBarangInput = Partial<Omit<CreateBarangInput, "partNumber">>;

// ====== Zod helpers ======
const trimStr = (min: number, max: number, label = "Field") =>
  z
    .string()
    .trim()
    .min(min, { message: `${label} wajib diisi` })
    .max(max, { message: `${label} maksimal ${max} karakter` });

/**
 * ✅ Angka boleh 0, tidak boleh negatif.
 * Pakai coerce agar input string dari client tetap bisa divalidasi.
 */
const nonNegNum = (label: string) =>
  z.coerce
    .number()
    .finite({ message: `${label} harus angka valid` })
    .min(0, { message: `${label} tidak boleh negatif` });

// ====== Zod ======
export const CreateBarangSchema = z.object({
  partNumber: trimStr(1, 50, "Part Number"),
  plant: trimStr(1, 20, "Plant"),
  materialDescription: trimStr(1, 255, "Material Description"),
  baseUnitOfMeasure: trimStr(1, 20, "Base Unit Of Measure"),

  reorderPoint: nonNegNum("ROP"),
  safetyStock: nonNegNum("Safety Stock"),

  materialGroup: z
    .string()
    .trim()
    .max(100, { message: "Material Group maksimal 100 karakter" })
    .optional()
    .nullable(),
});

export const UpdateBarangSchema = z
  .object({
    // ✅ plant boleh diedit
    plant: trimStr(1, 20, "Plant").optional(),

    materialDescription: trimStr(1, 255, "Material Description").optional(),
    baseUnitOfMeasure: trimStr(1, 20, "Base Unit Of Measure").optional(),

    reorderPoint: nonNegNum("ROP").optional(),
    safetyStock: nonNegNum("Safety Stock").optional(),

    materialGroup: z
      .string()
      .trim()
      .max(100, { message: "Material Group maksimal 100 karakter" })
      .optional()
      .nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "Minimal 1 field diubah",
  });
