"use client";

import { useStokBarang } from "../hooks/useStokBarang";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import StokAdjustmentModal from "./StokAdjustmentModal";
import { StokBarang } from "../types";

export default function StokBarangPage() {
  const sb = useStokBarang();

  const columns: DataTableColumn<StokBarang>[] = [
    { key: "kodeBarang", header: "Kode", accessor: "kodeBarang", width: 100 },
    { key: "namaBarang", header: "Nama Barang", accessor: "namaBarang" },
    { key: "warna", header: "Warna", accessor: "warna", width: 120 },
    { 
      key: "barangSiap", 
      header: "Siap (Fisik)", 
      accessor: "barangSiap",
      render: (r) => <strong style={{ color: "#16a34a" }}>{r.barangSiap.toLocaleString('id-ID')} {r.eum}</strong>
    },
    { 
      key: "barangHilang", 
      header: "Hilang", 
      accessor: "barangHilang",
      render: (r) => <span style={{ color: r.barangHilang > 0 ? "#dc2626" : "inherit" }}>{r.barangHilang.toLocaleString('id-ID')} {r.eum}</span>
    },
    { 
      key: "barangRusak", 
      header: "Rusak", 
      accessor: "barangRusak",
      render: (r) => <span style={{ color: r.barangRusak > 0 ? "#ea580c" : "inherit" }}>{r.barangRusak.toLocaleString('id-ID')} {r.eum}</span>
    },
  ];

  return (
    /* [REVISI] Menghapus maxWidth dan margin auto agar full width */
    <div style={{ padding: "24px" }}>
      
      {/* HEADER PAGE */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ margin: 0, fontSize: "28px", color: "#0f172a", fontWeight: 700 }}>Stok Gudang Real-Time</h2>
        <p style={{ margin: "8px 0 0 0", fontSize: "15px", color: "#64748b" }}>
          Pantau ketersediaan barang dan lakukan penyesuaian (Inventory Adjustment) jika ada anomali fisik.
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {sb.error && !sb.modalOpen && (
        <div style={{ padding: "16px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", marginBottom: "24px", borderLeft: "4px solid #ef4444" }}>
          <strong>Pemberitahuan:</strong> {sb.error}
        </div>
      )}

      {/* TABEL STOK MENGGUNAKAN SHARED DATATABLE */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <DataTable<StokBarang>
          title="Data Ketersediaan Barang"
          rows={sb.rows}
          columns={columns}
          rowKey={(r) => r.kodeBarang}
          loading={sb.loading}
          search={{ placeholder: "Cari nama atau kode barang...", keys: ["kodeBarang", "namaBarang"] }}
          actionsHeader="Tindakan"
          renderActions={(row) => (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                style={{ 
                  padding: "8px 16px", fontSize: "13px", fontWeight: 600, color: "#0369a1", 
                  background: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: "6px", cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#bae6fd"}
                onMouseOut={(e) => e.currentTarget.style.background = "#e0f2fe"}
                onClick={() => sb.openModal(row)}
              >
                ⚙️ Sesuaikan Stok
              </button>
            </div>
          )}
        />
      </div>

      {/* KOMPONEN MODAL YANG SUDAH DIPISAH */}
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