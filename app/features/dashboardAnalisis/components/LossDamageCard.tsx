"use client";

import { LossDamageData } from "../types";

export default function LossDamageCard({ lossDamage }: { lossDamage: LossDamageData[] }) {
  return (
    <div style={{ background: "#fff", padding: "28px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)", height: "100%" }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>Log Barang Hilang & Rusak</h3>
        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Jejak audit kerugian gudang</div>
      </div>
      
      <div style={{ overflowX: "auto", maxHeight: "350px" }}>
        <table style={{ width: '100%', fontSize: "14px", borderCollapse: "collapse" }}>
          <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <tr style={{ textAlign: 'left', color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <th style={{ padding: "0 12px 16px 0", fontWeight: 600, borderBottom: "2px solid #f1f5f9" }}>Item</th>
              <th style={{ padding: "0 12px 16px 12px", fontWeight: 600, borderBottom: "2px solid #f1f5f9" }}>Kasus</th>
              <th style={{ padding: "0 12px 16px 12px", fontWeight: 600, borderBottom: "2px solid #f1f5f9" }}>Catatan</th>
              <th style={{ padding: "0 0 16px 12px", fontWeight: 600, borderBottom: "2px solid #f1f5f9", textAlign: "right" }}>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {lossDamage.map((ld, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: "16px 12px 16px 0" }}>
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>{ld.namaBarang}</div>
                  <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px", fontWeight: 500 }}>{ld.quantity} {ld.eum}</div>
                </td>
                <td style={{ padding: "16px 12px" }}>
                  <span style={{ 
                    padding: '6px 12px', borderRadius: '8px', fontSize: "12px", fontWeight: 700,
                    background: ld.tipe === 'Hilang' ? '#fef2f2' : '#fff7ed', 
                    color: ld.tipe === 'Hilang' ? '#dc2626' : '#ea580c' 
                  }}>
                    {ld.tipe}
                  </span>
                </td>
                <td style={{ padding: "16px 12px", color: '#64748b', fontSize: "13px", maxWidth: "180px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={ld.catatan}>
                  {ld.catatan}
                </td>
                <td style={{ padding: "16px 0 16px 12px", color: "#94a3b8", fontSize: "12px", textAlign: "right", fontWeight: 500 }}>
                  {ld.postingDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lossDamage.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Gudang aman, tidak ada kerugian tercatat.</div>}
      </div>
    </div>
  );
}