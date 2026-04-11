// app/features/katalogBarang/components/BarangFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/manajemenAkun.module.css";
import type {
  CreateBarangInput,
  KatalogBarangRow,
  UpdateBarangInput,
} from "@/app/features/katalogBarang/types";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial: KatalogBarangRow | null;
  onClose: () => void;
  onSubmit: (payload: CreateBarangInput | UpdateBarangInput) => Promise<void>;
};

/**
 * Sanitizer: hanya boleh angka + 1 titik desimal.
 * - TIDAK mengizinkan tanda minus
 * - menghapus karakter selain digit dan '.'
 * - jika banyak '.', sisakan yang pertama
 */
function sanitizeNonNegativeDecimal(raw: string) {
  let s = String(raw ?? "").replaceAll("-", ""); // block minus
  s = s.replace(/[^\d.]/g, ""); // only digits + dot

  const firstDot = s.indexOf(".");
  if (firstDot >= 0) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  // kalau user kosongin input, BIARKAN kosong
  if (s === "") return "";

  // prevent leading dot -> "0."
  if (s.startsWith(".")) s = "0" + s;

  return s;
}


function toNonNegNumberOrThrow(label: string, raw: string) {
  const s = String(raw ?? "").trim();
  if (s === "") throw new Error(`${label} wajib diisi`); // ✅ wajib diisi
  const n = Number(s);
  if (!Number.isFinite(n) || Number.isNaN(n)) throw new Error(`${label} harus angka`);
  if (n < 0) throw new Error(`${label} harus angka >= 0`);
  return n;
}

export default function BarangFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [partNumber, setPartNumber] = useState("");
  const [plant, setPlant] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [baseUnitOfMeasure, setBaseUnitOfMeasure] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [safetyStock, setSafetyStock] = useState("");
  const [materialGroup, setMaterialGroup] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);

    if (mode === "edit" && initial) {
      setPartNumber(initial.partNumber);
      setPlant(initial.plant);
      setMaterialDescription(initial.materialDescription);
      setBaseUnitOfMeasure(initial.baseUnitOfMeasure);
      setReorderPoint(
        initial.reorderPoint === null || initial.reorderPoint === undefined
          ? ""
          : String(initial.reorderPoint)
      );
      setSafetyStock(
        initial.safetyStock === null || initial.safetyStock === undefined
          ? ""
          : String(initial.safetyStock)
      );
      setMaterialGroup(initial.materialGroup ?? "");
    } else {
      setPartNumber("");
      setPlant("");
      setMaterialDescription("");
      setBaseUnitOfMeasure("");
      setReorderPoint("");
      setSafetyStock("");
      setMaterialGroup("");
    }
  }, [open, mode, initial]);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{mode === "edit" ? "Edit Barang" : "Tambah Barang"}</h3>
          <button
            className={styles.btnIcon}
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {err ? <div className={styles.alertError}>{err}</div> : null}

        <div className={styles.formGrid}>
          <label className={styles.label}>
            Part Number
            <input
              className={styles.input}
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              disabled={mode === "edit"} // ✅ partNumber tidak boleh diubah
              placeholder="contoh: PN001"
            />
          </label>

          <label className={styles.label}>
            Plant
            <input
              className={styles.input}
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              // ✅ boleh diedit juga saat edit (sesuai request)
              placeholder="contoh: AKSI"
            />
          </label>

          <label className={styles.label} style={{ gridColumn: "1 / -1" }}>
            Material Description
            <input
              className={styles.input}
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
            />
          </label>

          <label className={styles.label}>
            Base Unit Of Measure
            <input
              className={styles.input}
              value={baseUnitOfMeasure}
              onChange={(e) => setBaseUnitOfMeasure(e.target.value)}
            />
          </label>

          <label className={styles.label}>
            Material Group
            <input
              className={styles.input}
              value={materialGroup}
              onChange={(e) => setMaterialGroup(e.target.value)}
            />
          </label>

          <label className={styles.label}>
            ROP
            <input
              className={styles.input}
              value={reorderPoint}
              onChange={(e) => setReorderPoint(sanitizeNonNegativeDecimal(e.target.value))}
              inputMode="decimal"
              placeholder="contoh: 0 atau 5"
            />
          </label>

          <label className={styles.label}>
            Safety Stock
            <input
              className={styles.input}
              value={safetyStock}
              onChange={(e) => setSafetyStock(sanitizeNonNegativeDecimal(e.target.value))}
              inputMode="decimal"
              placeholder="contoh: 0 atau 5"
            />
          </label>

          <div className={styles.hint} style={{ gridColumn: "1 / -1" }}>
            *Jumlah (freeStock) tidak diinput manual. Otomatis dari tabel stock.
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.btnGhost}
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            Batal
          </button>

          <button
            className={styles.btnPrimary}
            disabled={saving}
            type="button"
            onClick={async () => {
              setSaving(true);
              setErr(null);

              try {
                const pn = partNumber.trim();
                const pl = plant.trim();

                if (mode === "create") {
                  if (!pn) throw new Error("Part Number wajib diisi");
                }
                // ✅ plant wajib untuk create & edit (karena boleh diedit)
                if (!pl) throw new Error("Plant wajib diisi");

                if (!materialDescription.trim()) throw new Error("Material wajib diisi");
                if (!baseUnitOfMeasure.trim()) throw new Error("Satuan wajib diisi");

                const rop = toNonNegNumberOrThrow("ROP", reorderPoint);
                const ss = toNonNegNumberOrThrow("Safety Stock", safetyStock);

                if (mode === "create") {
                  const payload: CreateBarangInput = {
                    partNumber: pn,
                    plant: pl,
                    materialDescription: materialDescription.trim(),
                    baseUnitOfMeasure: baseUnitOfMeasure.trim(),
                    reorderPoint: rop,
                    safetyStock: ss,
                    materialGroup: materialGroup.trim()
                      ? materialGroup.trim()
                      : null,
                  };
                  await onSubmit(payload);
                } else {
                  const payload: UpdateBarangInput = {
                    // ✅ bisa pindah plant
                    plant: pl,
                    materialDescription: materialDescription.trim(),
                    baseUnitOfMeasure: baseUnitOfMeasure.trim(),
                    reorderPoint: rop,
                    safetyStock: ss,
                    materialGroup: materialGroup.trim()
                      ? materialGroup.trim()
                      : null,
                  };
                  await onSubmit(payload);
                }
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Gagal menyimpan");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
