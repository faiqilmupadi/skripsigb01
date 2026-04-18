"use client";

import { PurchaseOrderGroup } from "../types";
import styles from "@/styles/manajemenAkun.module.css";

type Props = {
  data: PurchaseOrderGroup | null;
  onClose: () => void;
};

export default function PurchaseOrderDetail({ data, onClose }: Props) {
  if (!data) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyItems: "center", zIndex: 1000, padding: "20px", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ margin: "0 0 16px 0" }}>Detail Pesanan: {data.nomorPurchaseOrder}</h3>
        <p><strong>Vendor:</strong> {data.namaVendor} ({data.kodeVendor})</p>
        <p><strong>Tanggal:</strong> {data.tanggal}</p>
        <p><strong>Status:</strong> {data.status}</p>
        <p><strong>Catatan:</strong> {data.catatan || "-"}</p>
        
        <table style={{ width: "100%", marginTop: "16px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Barang</th>
              <th style={{ padding: "8px" }}>Qty</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Harga Satuan</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((i, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px" }}>{i.kodeBarang} - {i.namaBarang}</td>
                <td style={{ padding: "8px" }}>{i.qty} {i.eum}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>Rp {Number(i.hargaSatuan).toLocaleString("id-ID")}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>Rp {Number(i.totalHarga).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <h4 style={{ textAlign: "right", marginTop: "16px", color: "#0f172a" }}>
          Grand Total: Rp {Number(data.totalSemuaHarga).toLocaleString("id-ID")}
        </h4>
        
        <button onClick={onClose} className={styles.btnPrimary} style={{ marginTop: "24px", width: "100%" }}>
          Tutup
        </button>
      </div>
    </div>
  );
}