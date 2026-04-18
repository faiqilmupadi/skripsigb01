"use client";

import Form from "@/app/components/shared/Form";
import { BarangOption, Vendor, VendorList, VendorListFormData } from "../types";
import styles from "@/styles/manajemenAkun.module.css";

type Props = {
  open: boolean;
  editTarget: VendorList | null;
  form: VendorListFormData;
  vendors: Vendor[];
  barangOptions: BarangOption[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  onChange: (patch: Partial<VendorListFormData>) => void;
  onKodeVendorChange: (kodeVendor: string) => void;
  onKodeBarangChange: (kodeBarang: string) => void;
};

export default function VendorListForm({
  open, editTarget, form, vendors, barangOptions, saving, error,
  onClose, onSubmit, onChange, onKodeVendorChange, onKodeBarangChange
}: Props) {
  const isEdit = !!editTarget;

  return (
    <Form
      open={open}
      title={isEdit ? "Edit Vendor List" : "Tambah Vendor List"}
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      error={error}
      maxWidth="520px"
    >
      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>Kode Vendor</label>
        <select
          className={styles.input}
          value={form.kodeVendor}
          onChange={(e) => onKodeVendorChange(e.target.value)}
          disabled={isEdit}
        >
          <option value="">-- Pilih Vendor --</option>
          {vendors.map((v) => (
            <option key={v.kodeVendor} value={v.kodeVendor}>
              {v.kodeVendor} — {v.namaVendor}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>Nama Vendor</label>
        <input
          className={styles.input}
          value={form.namaVendor}
          readOnly
          placeholder="Terisi otomatis"
          style={{ background: "var(--color-background-secondary)", cursor: "not-allowed", color: "var(--color-text-secondary)" }}
        />
      </div>

      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>Barang</label>
        <select
          className={styles.input}
          value={form.kodeBarang}
          onChange={(e) => onKodeBarangChange(e.target.value)}
          disabled={isEdit}
        >
          <option value="">-- Pilih Barang --</option>
          {barangOptions.map((b) => (
            <option key={b.kodeBarang} value={b.kodeBarang}>
              {b.kodeBarang} — {b.namaBarang} ({b.warna})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", gridColumn: "1 / -1" }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nama Barang</label>
          <input
            className={styles.input}
            value={form.namaBarang}
            readOnly
            placeholder="Auto-fill"
            style={{ background: "var(--color-background-secondary)", cursor: "not-allowed", color: "var(--color-text-secondary)" }}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Warna</label>
          <input
            className={styles.input}
            value={form.warnaBarang}
            readOnly
            placeholder="Auto-fill"
            style={{ background: "var(--color-background-secondary)", cursor: "not-allowed", color: "var(--color-text-secondary)" }}
          />
        </div>
      </div>

      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>Harga Dari Vendor (Rp)</label>
        <input
          type="number"
          className={styles.input}
          value={form.hargaDariVendor}
          onChange={(e) => onChange({ hargaDariVendor: e.target.value ? Number(e.target.value) : "" })}
          placeholder="Contoh: 150000"
        />
      </div>

      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>EuM (Unit of Measure)</label>
        <input
          className={styles.input}
          value={form.eum}
          onChange={(e) => onChange({ eum: e.target.value })}
          placeholder="Contoh: Dus, Pcs"
        />
      </div>
    </Form>
  );
}