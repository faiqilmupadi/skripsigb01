"use client";

import { useNotifikasiROP } from "../hooks/useNotifikasiROP";

export default function NotifikasiROP() {
  const { items, visible, dismiss } = useNotifikasiROP();

  if (!visible || items.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "380px",
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      borderLeft: "6px solid #ef4444",
      zIndex: 9999,
      overflow: "hidden",
      fontFamily: "sans-serif"
    }}>
      {/* Header Notifikasi */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#fef2f2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b91c1c", fontWeight: "bold", fontSize: "15px" }}>
          <span>⚠️</span> Peringatan Reorder Point (ROP)
        </div>
        <button 
          onClick={dismiss}
          style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "20px", cursor: "pointer", padding: "0 4px" }}
          title="Tutup Notifikasi"
        >
          &times;
        </button>
      </div>

      {/* Body Notifikasi */}
      <div style={{ padding: "16px 20px", maxHeight: "300px", overflowY: "auto" }}>
        <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
          Sistem mendeteksi ada <strong>{items.length} barang</strong> yang stoknya sudah menyentuh batas kritis berdasarkan kalkulasi ROP harian. Segera buat Purchase Order:
        </p>
        
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
              <div style={{ fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>
                {item.kodeBarang} - {item.namaBarang}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                <span>Stok: <strong style={{ color: "#ef4444" }}>{item.barangSiap.toLocaleString()} {item.eum}</strong></span>
                <span>Batas ROP: <strong>{item.rop.toLocaleString()} {item.eum}</strong></span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}