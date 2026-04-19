"use client";

import { useState, useEffect } from "react";
import { TabType } from "../types";

type Props = {
  open: boolean; type: TabType; initialData: any; saving: boolean; error: string;
  onClose: () => void; onSave: (data: any) => void;
};

export default function ManajemenFormModal({ open, type, initialData, saving, error, onClose, onSave }: Props) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (open) setForm(initialData || (type === "admin" ? { roleUser: "Admin" } : {}));
  }, [open, initialData, type]);

  if (!open) return null;
  const isEdit = !!initialData;
  const isOwner = isEdit && initialData?.roleUser === "Owner";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "white", padding: 32, borderRadius: 24, width: "100%", maxWidth: 500, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ margin: "0 0 24px 0" }}>{isEdit ? "Edit" : "Tambah"} {type === "admin" ? "Akun" : "Vendor"}</h2>
        
        {error && <div style={{ padding: 12, background: "#fef2f2", color: "#991b1b", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {type === "admin" ? (
            <>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>User ID</label>
                <input disabled={isEdit} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: isEdit ? "#f1f5f9" : "white" }} value={form.userId || ""} onChange={e => setForm({...form, userId: e.target.value})} placeholder="Contoh: U001" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Username (Login)</label>
                <input style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} value={form.username || ""} onChange={e => setForm({...form, username: e.target.value})} placeholder="fatih123" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
                <input type="email" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} value={form.email || ""} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@contoh.com" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nama Lengkap</label>
                <input style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} value={form.namaUser || ""} onChange={e => setForm({...form, namaUser: e.target.value})} placeholder="Nama Lengkap Admin/Vendor" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Role Akses</label>
                <select disabled={isOwner} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: isOwner ? "#f1f5f9" : "white" }} value={form.roleUser || "Admin"} onChange={e => setForm({...form, roleUser: e.target.value})}>
                  {isOwner ? (
                    <option value="Owner">Owner (Tidak bisa diubah)</option>
                  ) : (
                    <>
                      <option value="Admin">Admin</option>
                      <option value="Vendor">Vendor</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password {isEdit && "(Kosongkan jika tidak diubah)"}</label>
                <input type="password" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} value={form.password || ""} onChange={e => setForm({...form, password: e.target.value})} placeholder="******" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Kode Vendor</label>
                <input disabled={isEdit} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: isEdit ? "#f1f5f9" : "white" }} value={form.kodeVendor || ""} onChange={e => setForm({...form, kodeVendor: e.target.value})} placeholder="Contoh: VND01" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nama Perusahaan / Vendor</label>
                <input style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} value={form.namaVendor || ""} onChange={e => setForm({...form, namaVendor: e.target.value})} placeholder="PT. Sukses Bersama" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Akun Terkait (User ID)</label>
                <input style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} value={form.userId || ""} onChange={e => setForm({...form, userId: e.target.value})} placeholder="Masukkan ID User dari tab Akun (opsional)" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Alamat Lengkap</label>
                <textarea rows={3} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", resize: "none" }} value={form.alamat || ""} onChange={e => setForm({...form, alamat: e.target.value})} placeholder="Alamat lengkap perusahaan..." />
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 16px", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600, color: "#64748b" }}>Batal</button>
          <button onClick={() => onSave(form)} disabled={saving} style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>
      </div>
    </div>
  );
}