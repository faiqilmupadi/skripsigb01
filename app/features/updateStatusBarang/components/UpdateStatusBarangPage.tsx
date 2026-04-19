// C:\faiq\skripsi\skripsigb01\app\features\updateStatusBarang\components\UpdateStatusBarangPage.tsx
"use client";

import { useUpdateStatusBarang } from "../hooks/useUpdateStatusBarang";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import VendorHeader from "./VendorHeader";
import VendorUpdateModal from "./VendorUpdateModal";
import { POVendorGroup } from "../types";
import { sharedStyles } from "@/app/components/shared/UIStyles";

const statusConfig: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  "Sudah Dipesan":           { bg: "#eff6ff", color: "#0284c7", border: "#bae6fd", dot: "#38bdf8" },
  "Sedang Dikemas":          { bg: "#fefce8", color: "#a16207", border: "#fef08a", dot: "#facc15" },
  "Sedang Dalam Pengiriman": { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", dot: "#fb923c" },
  "Selesai":                 { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#4ade80" },
};

export default function UpdateStatusBarangPage() {
  const {
    vendorInfo, rows, loading, updating, error,
    timePreset, setTimePreset, customStart, setCustomStart, customEnd, setCustomEnd,
    updateTarget, newStatus, setNewStatus, openUpdateModal, closeUpdateModal, handleUpdateStatus,
  } = useUpdateStatusBarang();

  const columns: DataTableColumn<POVendorGroup>[] = [
    { key: "nomorPurchaseOrder", header: "Nomor PO", accessor: "nomorPurchaseOrder", width: 140 },
    { key: "tanggal", header: "Tanggal", accessor: "tanggal", width: 120 },
    {
      key: "items", header: "Isi Pesanan",
      render: (row) => (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "#334155", lineHeight: 1.7 }}>
          {row.items.map((i, idx) => (
            <li key={idx}><strong>{i.qty} {i.eum}</strong> — {i.namaBarang}</li>
          ))}
        </ul>
      ),
    },
    {
      key: "status", header: "Status Pengiriman", width: 200,
      render: (rowOrVal: any) => {
        const s = typeof rowOrVal === "object" && rowOrVal !== null ? rowOrVal.status : rowOrVal;
        const cfg = statusConfig[s] ?? { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1", dot: "#94a3b8" };
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}`,
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            {s}
          </span>
        );
      },
    },
  ];

  return (
    // UBAH BARIS INI: Hapus maxWidth dan margin
    <div style={sharedStyles.pageWrapper}>
      
      <div style={sharedStyles.headerContainer}>
        <div>
          <h1 style={sharedStyles.pageTitle}>
            Portal Pesanan Vendor
          </h1>
          <p style={sharedStyles.pageSubtitle}>
            Kelola dan perbarui status pesanan dari Gudang secara aktual. Pastikan status pengiriman selalu diperbarui.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: 16, borderRadius: 10, marginBottom: 24, borderLeft: "4px solid #ef4444", fontSize: 13.5 }}>
          <strong>Pemberitahuan:</strong> {error}
        </div>
      )}
      <VendorHeader vendorInfo={vendorInfo} />

      <div style={{ marginBottom: 20 }}>
        <TimeRangeFilter
          preset={timePreset} setPreset={setTimePreset}
          customStart={customStart} setCustomStart={setCustomStart}
          customEnd={customEnd} setCustomEnd={setCustomEnd}
        />
      </div>

      <DataTable<POVendorGroup>
        title="Daftar Pesanan Masuk"
        rows={rows}
        columns={columns}
        rowKey={(r) => r.nomorPurchaseOrder}
        loading={loading}
        search={{ placeholder: "Cari nomor Purchase Order...", keys: ["nomorPurchaseOrder"] }}
        actionsHeader="Tindakan"
        renderActions={(row) => (
          row.status === "Selesai" ? (
            <span style={{
              fontSize: 12.5, color: "#94a3b8", background: "#f8fafc",
              padding: "6px 14px", borderRadius: 8, fontWeight: 600,
              border: "1.5px solid #e2e8f0", display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              🔒 Terkunci
            </span>
          ) : (
            <button
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 16px", fontSize: 13, fontWeight: 700, color: "#fff",
                background: "#2563eb", border: "none", borderRadius: 8, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "background 0.15s",
                fontFamily: "inherit",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "#2563eb"; }}
              onClick={() => openUpdateModal(row)}
            >
              Ubah Status
            </button>
          )
        )}
      />

      <VendorUpdateModal
        open={!!updateTarget}
        updateTarget={updateTarget}
        newStatus={newStatus}
        updating={updating}
        onStatusChange={setNewStatus}
        onClose={closeUpdateModal}
        onSubmit={handleUpdateStatus}
      />
    </div>
  );
}