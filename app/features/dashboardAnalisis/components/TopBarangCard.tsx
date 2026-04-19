"use client";

import { TopBarang } from "../types";

export default function TopBarangCard({ topBarang }: { topBarang: TopBarang[] }) {
  return (
    <div style={{ background: "#fff", padding: "24px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: 700 }}>Barang Terlaris</h3>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Berdasarkan volume Sales Order</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {topBarang.map((b, i) => (
          <div key={b.kodeBarang} style={{ padding: '12px 16px', background: "#f8fafc", borderRadius: "16px", display: 'flex', alignItems: 'center', gap: "16px", transition: "transform 0.2s" }}>
            <div style={{ 
              width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800,
              background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : "#ffedd5",
              color: i === 0 ? "#d97706" : i === 1 ? "#64748b" : "#c2410c"
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>{b.namaBarang}</div>
              <div style={{ fontSize: "13px", color: '#64748b', marginTop: "2px" }}>{b.kodeBarang}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>{b.totalTerjual.toLocaleString()}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Unit Out</div>
            </div>
          </div>
        ))}
        {topBarang.length === 0 && <p style={{ fontSize: "14px", color: "#94a3b8", padding: "12px" }}>Belum ada data penjualan.</p>}
      </div>
    </div>
  );
}