"use client";

import { useRiwayatTransaksi } from "../hooks/useRiwayatTransaksi";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import { MovementData } from "../types";

export default function RiwayatTransaksiPage() {
  const { preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd, rows, loading, handlePrintPDF } = useRiwayatTransaksi();

  const columns: DataTableColumn<MovementData>[] = [
    { key: "tanggal", header: "Tanggal", accessor: "postingDate", width: 110 },
    { 
      key: "tipe", 
      header: "Tipe", 
      accessor: "movementType",
      render: (r: any) => {
        let label = "Lainnya", bg = "#f1f5f9", color = "#475569";
        if (r.movementType === 'POTP123') { label = "Masuk (PO)"; bg = "#dcfce7"; color = "#166534"; }
        else if (r.movementType === 'SOTP123') { label = "Keluar (SO)"; bg = "#e0f2fe"; color = "#0369a1"; }
        else if (r.movementType === 'KTP123') { label = "Hilang"; bg = "#fee2e2"; color = "#991b1b"; }
        else if (r.movementType === 'KTP124' || r.movementType === 'RTP123') { label = "Rusak"; bg = "#ffedd5"; color = "#9a3412"; }

        return <span style={{ background: bg, color, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{label}</span>;
      }
    },
    { 
      key: "dokumen", 
      header: "No. Dokumen", 
      render: (r: any) => <span style={{ fontWeight: 600, fontSize: '13px' }}>{r.nomorPurchaseOrder || r.nomorSalesOrder || "-"}</span>
    },
    { key: "barang", header: "Barang", render: (r: any) => <div style={{fontSize: '13px'}}>{r.namaBarang} <br/><small style={{color:'gray'}}>{r.kodeBarang}</small></div> },
    { key: "qty", header: "Qty", render: (r: any) => <strong>{r.quantity} {r.eum}</strong> },
    
    // 1. Tambahkan Kolom Total Harga
    { 
      key: "harga", 
      header: "Total Harga", 
      render: (r: any) => <span style={{ fontWeight: 600 }}>Rp {Number(r.totalHarga || 0).toLocaleString('id-ID')}</span> 
    },

    // 2. Tambahkan Kolom Status
    { 
      key: "status", 
      header: "Status", 
      render: (r: any) => {
        const s = r.status || "-";
        const isDone = s === "Selesai";
        return (
          <span style={{ 
            color: isDone ? "#16a34a" : "#64748b", 
            fontSize: '12px', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isDone ? "● " : ""} {s}
          </span>
        );
      }
    },

    // 3. Gunakan namaUser untuk PIC
    { 
      key: "pic", 
      header: "PIC (Admin)", 
      render: (r: any) => <span style={{ color: "#475569", fontWeight: 500 }}>{r.namaUser || r.userName}</span> 
    }
  ];
return (
    // [REVISI] Menghapus maxWidth: "1400px" dan mengubah padding agar full screen
    <div style={{ padding: "32px 40px", width: "100%", boxSizing: "border-box", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>Riwayat Transaksi (Buku Besar)</h1>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#64748b" }}>
            Lacak seluruh pergerakan barang masuk, keluar, hilang, dan rusak.
          </p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <TimeRangeFilter 
            preset={preset} setPreset={setPreset}
            customStart={customStart} setCustomStart={setCustomStart}
            customEnd={customEnd} setCustomEnd={setCustomEnd}
          />
          <button 
            onClick={handlePrintPDF} 
            disabled={loading || rows.length === 0}
            style={{ 
              padding: "10px 16px", background: loading || rows.length === 0 ? "#cbd5e1" : "#1e293b", 
              color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: loading || rows.length === 0 ? "not-allowed" : "pointer" 
            }}
          >
            🖨️ Cetak PDF
          </button>
        </div>
      </div>

      <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)" }}>
        <DataTable<MovementData>
          title="Tabel Pergerakan Barang"
          rows={rows}
          columns={columns}
          rowKey={(r) => r.movementId ? r.movementId.toString() : `${r.kodeBarang}-${r.postingDate}-${Math.random()}`}
          loading={loading}
          search={{ placeholder: "Cari nomor dokumen atau barang...", keys: ["nomorPurchaseOrder", "nomorSalesOrder", "namaBarang", "kodeBarang"] }}
        />
      </div>
    </div>
  );
}