"use client";

import { POVendorGroup } from "../types";

type Props = {
  open: boolean;
  updateTarget: POVendorGroup | null;
  newStatus: string;
  updating: boolean;
  onStatusChange: (status: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function VendorUpdateModal({ open, updateTarget, newStatus, updating, onStatusChange, onClose, onSubmit }: Props) {
  if (!open || !updateTarget) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ background: "white", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "20px", fontWeight: 700 }}>
          Update Status Pengiriman
        </h3>
        <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "14px" }}>
          Purchase Order: <strong style={{ color: "#0f172a" }}>{updateTarget.nomorPurchaseOrder}</strong>
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>Pilih Fase Pengiriman</label>
          <select 
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", color: "#0f172a", background: "#f8fafc" }}
            value={newStatus} 
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="Sudah Dipesan">Sudah Dipesan</option>
            <option value="Sedang Dikemas">📦 Sedang Dikemas</option>
            <option value="Sedang Dalam Pengiriman">🚚 Sedang Dalam Pengiriman</option>
          </select>
          <div style={{ marginTop: "12px", padding: "12px", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
            <small style={{ color: "#166534", display: "block", fontSize: "12.5px", lineHeight: "1.5" }}>
              💡 <strong>Info:</strong> Status "Selesai" hanya dapat diaktifkan oleh Admin Gudang setelah barang diterima.
            </small>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "32px", justifyContent: "flex-end" }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
          >
            Kembali
          </button>
          <button 
            type="button" 
            onClick={onSubmit} 
            disabled={updating}
            style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: updating ? "not-allowed" : "pointer", opacity: updating ? 0.7 : 1 }}
          >
            {updating ? "Memproses..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}