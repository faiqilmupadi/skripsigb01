"use client";

import { useUpdateStatusBarang } from "../hooks/useUpdateStatusBarang";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import VendorHeader from "./VendorHeader";
import VendorUpdateModal from "./VendorUpdateModal";
import { POVendorGroup } from "../types";

export default function UpdateStatusBarangPage() {
  const { 
    vendorInfo, rows, loading, updating, error,
    timePreset, setTimePreset, customStart, setCustomStart, customEnd, setCustomEnd,
    updateTarget, newStatus, setNewStatus, openUpdateModal, closeUpdateModal, handleUpdateStatus 
  } = useUpdateStatusBarang();

  const columns: DataTableColumn<POVendorGroup>[] = [
    { key: "nomorPurchaseOrder", header: "Nomor PO", accessor: "nomorPurchaseOrder", width: 140 },
    { key: "tanggal", header: "Tanggal", accessor: "tanggal", width: 120 },
    { 
      key: "items", 
      header: "Isi Pesanan", 
      render: (row) => (
        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
          {row.items.map((i, idx) => ( 
            <li key={idx}><strong>{i.qty} {i.eum}</strong> - {i.namaBarang}</li> 
          ))}
        </ul>
      ) 
    },
    { 
      key: "status", 
      header: "Status Pengiriman", 
      accessor: "status", 
      width: 180,
      render: (rowOrVal: any) => {
        const statusVal = typeof rowOrVal === "object" && rowOrVal !== null ? rowOrVal.status : rowOrVal;
        let bg = "#f1f5f9", text = "#475569", border = "#cbd5e1";
        if (statusVal === "Sudah Dipesan") { bg = "#eff6ff"; text = "#0284c7"; border = "#bae6fd"; } 
        else if (statusVal === "Sedang Dikemas") { bg = "#fefce8"; text = "#a16207"; border = "#fef08a"; } 
        else if (statusVal === "Sedang Dalam Pengiriman") { bg = "#fff7ed"; text = "#c2410c"; border = "#fed7aa"; } 
        else if (statusVal === "Selesai") { bg = "#f0fdf4"; text = "#15803d"; border = "#bbf7d0"; } 
        return (
          <span style={{ 
            background: bg, color: text, border: `1px solid ${border}`, 
            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, 
            display: 'inline-block', textAlign: 'center' 
          }}>
            {statusVal}
          </span>
        );
      }
    },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* HEADER PAGE */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ margin: 0, fontSize: "28px", color: "#0f172a", fontWeight: 700 }}>Portal Pesanan Vendor</h2>
        <p style={{ margin: "8px 0 0 0", fontSize: "15px", color: "#64748b", maxWidth: "600px" }}>
          Kelola dan perbarui status pesanan dari Gudang secara aktual. Pastikan status pengiriman selalu diperbarui.
        </p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "16px", borderRadius: "8px", marginBottom: "24px", borderLeft: "4px solid #ef4444" }}>
          <strong>Pemberitahuan:</strong> {error}
        </div>
      )}

      {/* HEADER VENDOR */}
      <VendorHeader vendorInfo={vendorInfo} />

      {/* KOMPONEN FILTER WAKTU */}
      <div style={{ marginBottom: "24px" }}>
         <TimeRangeFilter 
            preset={timePreset} 
            setPreset={setTimePreset}
            customStart={customStart}
            setCustomStart={setCustomStart}
            customEnd={customEnd}
            setCustomEnd={setCustomEnd}
         />
      </div>

      {/* TABEL DATA */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <DataTable<POVendorGroup>
          title="Daftar Pesanan Masuk"
          rows={rows} 
          columns={columns}
          rowKey={(r) => r.nomorPurchaseOrder}
          loading={loading}
          search={{ placeholder: "Cari nomor Purchase Order...", keys: ["nomorPurchaseOrder"] }}
          actionsHeader="Tindakan"
          renderActions={(row) => (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {row.status === "Selesai" ? (
                <span style={{ fontSize: "13px", color: "#94a3b8", background: "#f8fafc", padding: "6px 12px", borderRadius: "6px", fontWeight: 500, border: "1px solid #e2e8f0" }}>
                  🔒 Terkunci
                </span>
              ) : (
                <button 
                  style={{ 
                    padding: "8px 16px", fontSize: "13px", fontWeight: 600, color: "#fff", 
                    background: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer", 
                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)", transition: "background 0.2s" 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#1d4ed8"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#2563eb"}
                  onClick={() => openUpdateModal(row)}
                >
                  Ubah Status
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* MODAL UBAH STATUS */}
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