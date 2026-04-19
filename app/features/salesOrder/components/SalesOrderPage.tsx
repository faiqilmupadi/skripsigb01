// C:\faiq\skripsi\skripsigb01\app\features\salesOrder\components\SalesOrderPage.tsx
"use client";

import { useSalesOrder } from "../hooks/useSalesOrder";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import SalesOrderForm from "./SalesOrderForm";
import { SalesOrderGroup } from "../types";
import { sharedStyles } from "@/app/components/shared/UIStyles";

export default function SalesOrderPage() {
  const so = useSalesOrder();

  const columns: DataTableColumn<SalesOrderGroup>[] = [
    { key: "nomorSalesOrder", header: "Nomor SO", accessor: "nomorSalesOrder", width: 160 },
    { key: "tanggal", header: "Tanggal", accessor: "tanggal", width: 120 },
    { key: "pic", header: "PIC Pengirim", accessor: "penanggungJawab", width: 180 },
    {
      key: "items", header: "Rincian Barang Keluar",
      render: (row) => (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
          {row.items.map((i, idx) => (
            <li key={idx}>
              <strong>{i.qty} {i.eum}</strong> — {i.namaBarang}{" "}
              <span style={{ color: "#94a3b8", fontSize: 12 }}>(Rp {i.totalHarga.toLocaleString("id-ID")})</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "total", header: "Total Nilai Order",
      render: (row) => (
        <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 13.5 }}>
          Rp {row.totalSemuaHarga.toLocaleString("id-ID")}
        </span>
      ),
    },
  ];

  return (
    <div style={sharedStyles.pageWrapper}>
      <div style={sharedStyles.headerContainer}>
        <div>
          <h1 style={sharedStyles.pageTitle}>
            Sales Order (Pengeluaran)
          </h1>
          <p style={sharedStyles.pageSubtitle}>
            Catat pengeluaran barang fisik dengan konversi harga dan stok otomatis.
          </p>
        </div>
        <button 
          onClick={() => so.setFormOpen(true)} 
          style={{ ...sharedStyles.btnBase, ...sharedStyles.btnPrimary, alignSelf: "flex-start" }}
        >
          🚀 Keluarkan Barang (SO)
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <TimeRangeFilter
          preset={so.timePreset} setPreset={so.setTimePreset}
          customStart={so.customStart} setCustomStart={so.setCustomStart}
          customEnd={so.customEnd} setCustomEnd={so.setCustomEnd}
        />
      </div>

      {so.error && !so.formOpen && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: 16, borderRadius: 10, marginBottom: 20, borderLeft: "4px solid #ef4444", fontSize: 13.5 }}>
          <strong>Pemberitahuan:</strong> {so.error}
        </div>
      )}

      <DataTable<SalesOrderGroup>
        title="Riwayat Sales Order"
        rows={so.rows}
        columns={columns}
        rowKey={(r) => r.nomorSalesOrder}
        loading={so.loading}
        search={{ placeholder: "Cari nomor SO atau nama admin...", keys: ["nomorSalesOrder", "penanggungJawab"] }}
      />

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