"use client";

import Form from "@/app/components/shared/Form";
import { Vendor, VendorFormData } from "../types";

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

const fieldLabel: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: "#374151",
  letterSpacing: 0.2,
  textTransform: "uppercase",
  display: "block",
  marginBottom: 6,
};

const inputBase: React.CSSProperties = {
  padding: "10px 13px",
  fontSize: 13.5,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 500,
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  background: "#f8fafc",
  color: "#0f172a",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const inputDisabled: React.CSSProperties = {
  ...inputBase,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
};

export default function VendorForm({ open, editTarget, form, saving, error, onClose, onSubmit, onChange }: Props) {
  const isEdit = !!editTarget;

  return (
    <Form
      open={open}
      title={isEdit ? "Edit Data Vendor" : "Tambah Vendor Baru"}
      subtitle="Informasi perusahaan dan mitra gudang"
      icon="🏢"
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      submitText={isEdit ? "Simpan Perubahan" : "Tambah Vendor"}
      error={error}
      maxWidth="500px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Kode Vendor */}
        <div>
          <label style={fieldLabel}>Kode Vendor</label>
          <input
            style={isEdit ? inputDisabled : inputBase}
            value={form.kodeVendor}
            onChange={(e) => onChange({ kodeVendor: e.target.value })}
            placeholder="V-001"
            disabled={isEdit}
          />
          {isEdit && (
            <span style={{ display: "block", marginTop: 5, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
              Kode tidak dapat diubah setelah dibuat
            </span>
          )}
        </div>

        {/* Nama Vendor */}
        <div>
          <label style={fieldLabel}>Nama Vendor / Perusahaan</label>
          <input
            style={inputBase}
            value={form.namaVendor}
            onChange={(e) => onChange({ namaVendor: e.target.value })}
            placeholder="PT. Maju Bersama Indonesia"
          />
        </div>

        {/* Alamat */}
        <div>
          <label style={fieldLabel}>Alamat Lengkap</label>
          <textarea
            style={{ ...inputBase, resize: "vertical", minHeight: 90, lineHeight: 1.55 }}
            value={form.alamat}
            onChange={(e) => onChange({ alamat: e.target.value })}
            placeholder="Jl. Industri No. 12, Kawasan Berikat, Kota Bekasi..."
            rows={3}
          />
        </div>

        {/* Info note */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "11px 14px",
          background: "#eff6ff",
          border: "1.5px solid #bfdbfe",
          borderRadius: 10,
          color: "#1e40af",
          fontSize: 12.5,
          fontWeight: 500,
          lineHeight: 1.5,
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
          <span>
            Setelah menambah vendor, hubungkan akun pengguna dan daftar barang melalui tab <strong>Vendor List</strong>.
          </span>
        </div>
      </div>
    </Form>
  );
}