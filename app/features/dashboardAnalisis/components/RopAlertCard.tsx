"use client";

import { ROPStatus } from "../types";

export default function RopAlertCard({ alerts }: { alerts: ROPStatus[] }) {
  return (
    <div style={{ background: "#fff", padding: "24px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: 700 }}>Status Kesehatan Stok</h3>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Peringatan Reorder Point</div>
        </div>
      </div>
      
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: '100%', fontSize: "14px", borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <th style={{ padding: '0 0 12px 0', fontWeight: 600 }}>Item</th>
              <th style={{ padding: '0 0 12px 0', fontWeight: 600, textAlign: "right" }}>Stok / Batas</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((r, i) => {
              const percentage = Math.min(100, (r.stokSiap / r.batasRop) * 100);
              return (
                <tr key={r.kodeBarang} style={{ borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 0' }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{r.namaBarang}</div>
                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", width: "100%", marginTop: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${percentage}%`, background: "#ef4444", height: "100%", borderRadius: "3px" }} />
                    </div>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: "right" }}>
                    <div style={{ color: '#ef4444', fontWeight: 800, fontSize: "16px" }}>{r.stokSiap.toLocaleString()}</div>
                    <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>/ {r.batasRop.toLocaleString()}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {alerts.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center", background: "#f0fdf4", borderRadius: "16px", color: "#16a34a", fontWeight: 600 }}>
            Semua stok dalam keadaan aman 🎉
          </div>
        )}
      </div>
    </div>
  );
}