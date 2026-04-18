"use client";

import { VendorInfo } from "../types";

type Props = {
  vendorInfo: VendorInfo | null;
};

export default function VendorHeader({ vendorInfo }: Props) {
  if (!vendorInfo) return null;

  return (
    <div style={{ marginBottom: 32, padding: "20px 24px", background: "linear-gradient(to right, #f8fafc, #ffffff)", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: "32px", background: "#e2e8f0", padding: "12px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px" }}>
        🏢
      </div>
      <div>
        <h4 style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: 700 }}>
          {vendorInfo.namaVendor}
        </h4>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#475569" }}>
          Kode Referensi: <strong>{vendorInfo.kodeVendor}</strong> &nbsp;|&nbsp; PIC: <strong>{vendorInfo.namaUser}</strong>
        </p>
      </div>
    </div>
  );
}