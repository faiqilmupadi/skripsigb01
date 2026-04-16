"use client";

import Form from "@/app/components/shared/Form";
import { Vendor, VendorList, VendorListFormData } from "../types";
import styles from "@/styles/manajemenAkun.module.css";

type Props = {
  open: boolean;
  editTarget: VendorList | null;
  form: VendorListFormData;
  vendors: Vendor[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  onChange: (patch: Partial<VendorListFormData>) => void;
  onKodeVendorChange: (kodeVendor: string) => void;
};

export default function VendorListForm({
  open, editTarget, form, vendors, saving, error,
  onClose, onSubmit, onChange, onKodeVendorChange
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
          placeholder="Terisi otomatis dari kode vendor"
          style={{
            background: "var(--color-background-secondary)",
            cursor: "not-allowed",
            color: "var(--color-text-secondary)",
          }}
        />
      </div>

      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>Kode Barang</label>
        <input
          className={styles.input}
          value={form.kodeBarang}
          onChange={(e) => onChange({ kodeBarang: e.target.value })}
          placeholder="Contoh: BRG-001"
          disabled={isEdit}
        />
      </div>

      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>EuM (Unit of Measure)</label>
        <input
          className={styles.input}
          value={form.eum}
          onChange={(e) => onChange({ eum: e.target.value })}
          placeholder="Contoh: PCS, KG, BOX"
        />
      </div>
    </Form>
  );
}