"use client";

import { AdminActivity } from "../types";

export default function AdminActivityCard({ activities }: { activities: AdminActivity[] }) {
  return (
    <div style={{ background: "#fff", padding: "24px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: 700 }}>Beban Kerja Admin</h3>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Transaksi PO & SO</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: "20px" }}>
        {activities.map(adm => {
          const total = adm.poCount + adm.soCount;
          const poPercent = total > 0 ? (adm.poCount / total) * 100 : 0;
          const soPercent = total > 0 ? (adm.soCount / total) * 100 : 0;

          return (
            <div key={adm.userName}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: "14px", marginBottom: "8px", fontWeight: 600, color: "#1e293b" }}>
                <span>{adm.userName}</span>
                <span style={{ color: "#64748b", fontWeight: 500 }}>{total} Trx</span>
              </div>
              <div style={{ height: "12px", background: '#f1f5f9', borderRadius: "10px", overflow: 'hidden', display: 'flex' }}>
                 <div style={{ width: `${poPercent}%`, background: '#3b82f6' }} title={`PO: ${adm.poCount}`} />
                 <div style={{ width: `${soPercent}%`, background: '#22c55e' }} title={`SO: ${adm.soCount}`} />
              </div>
            </div>
          );
        })}
        {activities.length === 0 && <p style={{ fontSize: "14px", color: "#94a3b8" }}>Belum ada aktivitas.</p>}
      </div>

      <div style={{ display: "flex", gap: "16px", marginTop: "24px", fontSize: "13px", color: "#64748b", fontWeight: 500, padding: "12px", background: "#f8fafc", borderRadius: "12px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: 12, height: 12, background: "#3b82f6", borderRadius: "3px" }} /> Masuk (PO)</span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: 12, height: 12, background: "#22c55e", borderRadius: "3px" }} /> Keluar (SO)</span>
      </div>
    </div>
  );
}