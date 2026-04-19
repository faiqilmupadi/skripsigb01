"use client";

import { useState, useEffect } from "react";
import { TabType } from "../types";
import Form from "@/app/components/shared/Form";

type Props = {
  open: boolean;
  type: TabType;
  initialData: any;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (data: any) => void;
};

const inputStyle: React.CSSProperties = {
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

const inputDisabledStyle: React.CSSProperties = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: "#374151",
  letterSpacing: 0.2,
  textTransform: "uppercase" as const,
  marginBottom: 6,
  display: "block",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function ManajemenFormModal({ open, type, initialData, saving, error, onClose, onSave }: Props) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (open) setForm(initialData || (type === "admin" ? { roleUser: "Admin" } : {}));
  }, [open, initialData, type]);

  if (!open) return null;

  const isEdit = !!initialData;
  const isOwner = isEdit && initialData?.roleUser === "Owner";

  const isAdmin = type === "admin";

  return (
    <Form
      open={open}
      title={`${isEdit ? "Edit" : "Tambah"} ${isAdmin ? "Akun Pengguna" : "Data Vendor"}`}
      subtitle={isAdmin ? "Kelola akun dan hak akses sistem" : "Kelola data perusahaan vendor"}
      icon={isAdmin ? "👤" : "🏢"}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      saving={saving}
      submitText={isEdit ? "Simpan Perubahan" : isAdmin ? "Buat Akun" : "Tambah Vendor"}
      error={error}
      maxWidth="500px"
    >
      {isAdmin ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Row 1: User ID + Username */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="User ID">
              <input
                style={isEdit ? inputDisabledStyle : inputStyle}
                value={form.userId || ""}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                placeholder="U001"
                disabled={isEdit}
              />
            </Field>
            <Field label="Username (Login)">
              <input
                style={inputStyle}
                value={form.username || ""}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="fatih123"
              />
            </Field>
          </div>

          {/* Row 2: Nama Lengkap */}
          <Field label="Nama Lengkap">
            <input
              style={inputStyle}
              value={form.namaUser || ""}
              onChange={(e) => setForm({ ...form, namaUser: e.target.value })}
              placeholder="Nama Lengkap Admin / Vendor"
            />
          </Field>

          {/* Row 3: Email */}
          <Field label="Email">
            <input
              type="email"
              style={inputStyle}
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@contoh.com"
            />
          </Field>

          {/* Row 4: Role + Password */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Role Akses">
              <select
                style={isOwner ? { ...inputDisabledStyle, appearance: "none" } : { ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 34, cursor: "pointer" }}
                value={form.roleUser || "Admin"}
                onChange={(e) => setForm({ ...form, roleUser: e.target.value })}
                disabled={isOwner}
              >
                {isOwner ? (
                  <option value="Owner">Owner</option>
                ) : (
                  <>
                    <option value="Admin">Admin</option>
                    <option value="Vendor">Vendor</option>
                  </>
                )}
              </select>
            </Field>

            <Field label={isEdit ? "Password (kosongkan jika tidak diubah)" : "Password"}>
              <input
                type="password"
                style={inputStyle}
                value={form.password || ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
              />
            </Field>
          </div>

          {isOwner && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 10, fontSize: 12.5, color: "#92400e", fontWeight: 600 }}>
              🔒 Role Owner tidak dapat diubah dan akun ini tidak bisa dihapus.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Row 1: Kode Vendor */}
          <Field label="Kode Vendor">
            <input
              style={isEdit ? inputDisabledStyle : inputStyle}
              value={form.kodeVendor || ""}
              onChange={(e) => setForm({ ...form, kodeVendor: e.target.value })}
              placeholder="VND01"
              disabled={isEdit}
            />
          </Field>

          {/* Row 2: Nama Vendor */}
          <Field label="Nama Perusahaan / Vendor">
            <input
              style={inputStyle}
              value={form.namaVendor || ""}
              onChange={(e) => setForm({ ...form, namaVendor: e.target.value })}
              placeholder="PT. Sukses Bersama"
            />
          </Field>

          {/* Row 3: Akun Terkait */}
          <Field label="Akun Terkait (User ID)">
            <input
              style={inputStyle}
              value={form.userId || ""}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              placeholder="ID User dari tab Akun (opsional)"
            />
          </Field>

          {/* Row 4: Alamat */}
          <Field label="Alamat Lengkap">
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.55 }}
              value={form.alamat || ""}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              placeholder="Jl. Sudirman No. 1, Jakarta Selatan..."
              rows={3}
            />
          </Field>
        </div>
      )}
    </Form>
  );
}