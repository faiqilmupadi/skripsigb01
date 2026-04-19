"use client";

import { POStatusMonitor } from "../types";

type Props = { poData: POStatusMonitor[]; selectedStatus: string; setSelectedStatus: (s: string) => void; };

export default function PoMonitorCard({ poData, selectedStatus, setSelectedStatus }: Props) {
  return (
    <div style={{ background: "#fff", padding: "28px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)", height: "100%" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>Pantau Purchase Order</h3>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Lacak status pengiriman dari vendor</div>
        </div>
        <select 
          value={selectedStatus} 
          onChange={e => setSelectedStatus(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: "12px", border: '1px solid #e2e8f0', fontSize: "14px", fontWeight: 600, color: "#1e293b", background: "#f8fafc", outline: "none", cursor: "pointer" }}
        >
          <option value="Sudah Dipesan">📦 Sudah Dipesan</option>
          <option value="Sedang Dikemas">🛠️ Sedang Dikemas</option>
          <option value="Sedang Dalam Pengiriman">🚚 Dalam Pengiriman</option>
        </select>
      </div>

      <div style={{ overflowX: "auto", maxHeight: "350px" }}>
        <table style={{ width: '100%', fontSize: "14px", borderCollapse: "collapse" }}>
          <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <tr style={{ textAlign: 'left', color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <th style={{ padding: "0 12px 16px 0", fontWeight: 600, borderBottom: "2px solid #f1f5f9" }}>Nomor PO</th>
              <th style={{ padding: "0 12px 16px 12px", fontWeight: 600, borderBottom: "2px solid #f1f5f9" }}>Vendor</th>
              <th style={{ padding: "0 12px 16px 12px", fontWeight: 600, borderBottom: "2px solid #f1f5f9" }}>Barang</th>
              <th style={{ padding: "0 0 16px 12px", fontWeight: 600, borderBottom: "2px solid #f1f5f9", textAlign: "right" }}>Kuantitas</th>
            </tr>
          </thead>
          <tbody>
            {poData.map((po, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: "background 0.2s" }}>
                <td style={{ padding: "16px 12px 16px 0", fontWeight: 700, color: "#0f172a" }}>{po.nomorPurchaseOrder}</td>
                <td style={{ padding: "16px 12px", color: "#475569", fontWeight: 500 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", fontSize: "12px" }}>
                    {po.namaVendor}
                  </span>
                </td>
                <td style={{ padding: "16px 12px", color: "#1e293b", fontWeight: 600 }}>{po.namaBarang}</td>
                <td style={{ padding: "16px 0 16px 12px", color: "#0f172a", fontWeight: 700, textAlign: "right" }}>{po.qty} <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{po.eum}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {poData.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Tidak ada pesanan dengan status ini.</div>}
      </div>
    </div>
  );
}