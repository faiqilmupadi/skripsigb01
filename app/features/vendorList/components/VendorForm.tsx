"use client";

import Form from "@/app/components/shared/Form";
import { Vendor, VendorFormData } from "../types";
import styles from "@/styles/manajemenAkun.module.css";

type Props = {
  open: boolean;
  editTarget: Vendor | null;
  form: VendorFormData;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  onChange: (patch: Partial<VendorFormData>) => void;
};

export default function VendorForm({ open, editTarget, form, saving, error, onClose, onSubmit, onChange }: Props) {
  const isEdit = !!editTarget;

  return (
    <Form
      open={open}
      title={isEdit ? "Edit Vendor" : "Tambah Vendor"}
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      error={error}
      maxWidth="520px"
    >
      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>Kode Vendor</label>
        <input
          className={styles.input}
          value={form.kodeVendor}
          onChange={(e) => onChange({ kodeVendor: e.target.value })}
          placeholder="Contoh: V-001"
          disabled={isEdit}
        />
      </div>

      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>Nama Vendor</label>
        <input
          className={styles.input}
          value={form.namaVendor}
          onChange={(e) => onChange({ namaVendor: e.target.value })}
          placeholder="Nama perusahaan vendor"
        />
      </div>

      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.label}>Alamat</label>
        <textarea
          className={styles.input}
          value={form.alamat}
          onChange={(e) => onChange({ alamat: e.target.value })}
          placeholder="Alamat lengkap vendor"
          rows={3}
          style={{ resize: "vertical" }}
        />
      </div>

      <div style={{
          gridColumn: "1 / -1",
          background: "var(--color-background-info)",
          color: "var(--color-text-info)",
          borderRadius: 6,
          padding: "8px 12px",
          fontSize: 13,
      }}>

      </div>
    </Form>
  );
}