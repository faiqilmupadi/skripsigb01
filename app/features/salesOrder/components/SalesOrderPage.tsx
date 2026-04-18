"use client";

import { useSalesOrder } from "../hooks/useSalesOrder";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import SalesOrderForm from "./SalesOrderForm";
import styles from "@/styles/manajemenAkun.module.css";
import { SalesOrderGroup } from "../types";

export default function SalesOrderPage() {
  const so = useSalesOrder();

  const columns: DataTableColumn<SalesOrderGroup>[] = [
    { key: "nomorSalesOrder", header: "Nomor SO", accessor: "nomorSalesOrder", width: 160 },
    { key: "tanggal", header: "Tanggal", accessor: "tanggal", width: 120 },
    { key: "pic", header: "PIC Pengirim", accessor: "penanggungJawab", width: 180 },
    { 
      key: "items", header: "Rincian Barang Keluar", 
      render: (row) => (
        <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
          {row.items.map((i, idx) => ( <li key={idx}><strong>{i.qty} {i.eum}</strong> - {i.namaBarang} (Rp {i.totalHarga.toLocaleString('id-ID')})</li> ))}
        </ul>
      ) 
    },
    { 
      key: "total", header: "Total Nilai Order", 
      render: (row) => <strong style={{ color: "#0369a1" }}>Rp {row.totalSemuaHarga.toLocaleString("id-ID")}</strong> 
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a" }}>Sales Order (Pengeluaran)</h2>
          <p style={{ margin: "4px 0", fontSize: 14, color: "#64748b" }}>Catat pengeluaran barang fisik dengan konversi harga dan stok otomatis.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => so.setFormOpen(true)}>🚀 Keluarkan Barang (SO)</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
         <TimeRangeFilter preset={so.timePreset} setPreset={so.setTimePreset} customStart={so.customStart} setCustomStart={so.setCustomStart} customEnd={so.customEnd} setCustomEnd={so.setCustomEnd} />
      </div>

      {so.error && !so.formOpen && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "16px", borderRadius: "8px", marginBottom: "24px", borderLeft: "4px solid #ef4444" }}>
          <strong>Pemberitahuan:</strong> {so.error}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0" }}>
        <DataTable<SalesOrderGroup>
          title="Riwayat Sales Order"
          rows={so.rows}
          columns={columns}
          rowKey={(r) => r.nomorSalesOrder}
          loading={so.loading}
          search={{ placeholder: "Cari nomor SO atau nama admin...", keys: ["nomorSalesOrder", "penanggungJawab"] }}
        />
      </div>

      <SalesOrderForm 
        open={so.formOpen} saving={so.saving} error={so.error} form={so.form} 
        barangList={so.barangList} transformList={so.transformList} 
        onClose={() => so.setFormOpen(false)} onSubmit={so.handleSave} 
        handleItemChange={so.handleItemChange} handleEumChange={so.handleEumChange} 
        handleQtyChange={so.handleQtyChange} addItem={so.addItem} removeItem={so.removeItem} 
        getMultiplier={so.getMultiplier}
      />
    </div>
  );
}