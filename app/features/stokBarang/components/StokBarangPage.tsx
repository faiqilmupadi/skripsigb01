// C:\faiq\skripsi\skripsigb01\app\features\stokBarang\components\StokBarangPage.tsx
"use client";

import { useStokBarang } from "../hooks/useStokBarang";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import StokAdjustmentModal from "./StokAdjustmentModal";
import { StokBarang } from "../types";
import { sharedStyles } from "@/app/components/shared/UIStyles";

export default function StokBarangPage() {
  const sb = useStokBarang();

  const columns: DataTableColumn<StokBarang>[] = [
    { key: "kodeBarang", header: "Kode", accessor: "kodeBarang", width: 100 },
    { key: "namaBarang", header: "Nama Barang", accessor: "namaBarang" },
    { key: "warna", header: "Warna", accessor: "warna", width: 120 },
    {
      key: "barangSiap", header: "Siap (Fisik)", accessor: "barangSiap",
      render: (r) => (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontWeight: 700, color: "#15803d", fontSize: 13.5,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
          {r.barangSiap.toLocaleString("id-ID")} {r.eum}
        </span>
      ),
    },
    {
      key: "barangHilang", header: "Hilang", accessor: "barangHilang",
      render: (r) => (
        <span style={{ color: r.barangHilang > 0 ? "#dc2626" : "#94a3b8", fontWeight: r.barangHilang > 0 ? 700 : 500, fontSize: 13 }}>
          {r.barangHilang > 0 ? `⚠ ${r.barangHilang.toLocaleString("id-ID")} ${r.eum}` : `0 ${r.eum}`}
        </span>
      ),
    },
    {
      key: "barangRusak", header: "Rusak", accessor: "barangRusak",
      render: (r) => (
        <span style={{ color: r.barangRusak > 0 ? "#ea580c" : "#94a3b8", fontWeight: r.barangRusak > 0 ? 700 : 500, fontSize: 13 }}>
          {r.barangRusak > 0 ? `⚠ ${r.barangRusak.toLocaleString("id-ID")} ${r.eum}` : `0 ${r.eum}`}
        </span>
      ),
    },
  ];

  return (
    <div style={sharedStyles.pageWrapper}>
      <div style={sharedStyles.headerContainer}>
        <div>
          <h1 style={sharedStyles.pageTitle}>
            Stok Gudang Real-Time
          </h1>
          <p style={sharedStyles.pageSubtitle}>
            Pantau ketersediaan barang dan lakukan penyesuaian (Inventory Adjustment) jika ada anomali fisik.
          </p>
        </div>
      </div>

      {sb.error && !sb.modalOpen && (
        <div style={{ padding: 16, background: "#fef2f2", color: "#991b1b", borderRadius: 10, marginBottom: 20, borderLeft: "4px solid #ef4444", fontSize: 13.5 }}>
          <strong>Pemberitahuan:</strong> {sb.error}
        </div>
      )}

      <DataTable<StokBarang>
        title="Data Ketersediaan Barang"
        rows={sb.rows}
        columns={columns}
        rowKey={(r) => r.kodeBarang}
        loading={sb.loading}
        search={{ placeholder: "Cari nama atau kode barang...", keys: ["kodeBarang", "namaBarang"] }}
        actionsHeader="Tindakan"
        renderActions={(row) => (
          <button
            onClick={() => sb.openModal(row)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", fontSize: 12.5, fontWeight: 600,
              color: "#0369a1", background: "#e0f2fe",
              border: "1.5px solid #bae6fd", borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#bae6fd"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#e0f2fe"; }}
          >
            ⚙️ Sesuaikan
          </button>
        )}
      />

      <StokAdjustmentModal
        isOpen={sb.modalOpen}
        selectedStok={sb.selectedStok}
        tipe={sb.tipe}
        setTipe={sb.setTipe}
        qty={sb.qty}
        setQty={sb.setQty}
        maxQty={sb.maxQty}
        catatan={sb.catatan}
        setCatatan={sb.setCatatan}
        error={sb.error}
        setError={sb.setError}
        saving={sb.saving}
        onClose={sb.closeModal}
        onSave={sb.handleSave}
      />
    </div>
  );
}