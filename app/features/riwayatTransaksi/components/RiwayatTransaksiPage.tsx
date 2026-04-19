"use client";

import { useRiwayatTransaksi } from "../hooks/useRiwayatTransaksi";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import { MovementData } from "../types";

const movementConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  POTP123: { label: "Masuk (PO)", bg: "#dcfce7", color: "#166534", dot: "#4ade80" },
  SOTP123: { label: "Keluar (SO)", bg: "#e0f2fe", color: "#0369a1", dot: "#38bdf8" },
  KTP123:  { label: "Hilang",     bg: "#fee2e2", color: "#991b1b", dot: "#f87171" },
  KTP124:  { label: "Rusak",      bg: "#ffedd5", color: "#9a3412", dot: "#fb923c" },
  RTP123:  { label: "Rusak",      bg: "#ffedd5", color: "#9a3412", dot: "#fb923c" },
};

export default function RiwayatTransaksiPage() {
  const { preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd, rows, loading, handlePrintPDF } = useRiwayatTransaksi();

  const columns: DataTableColumn<MovementData>[] = [
    { key: "tanggal", header: "Tanggal", accessor: "postingDate", width: 110 },
    {
      key: "tipe", header: "Tipe",
      render: (r: any) => {
        const cfg = movementConfig[r.movementType] ?? { label: "Lainnya", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: cfg.bg, color: cfg.color,
            padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "dokumen", header: "No. Dokumen",
      render: (r: any) => (
        <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace", color: "#0f172a" }}>
          {r.nomorPurchaseOrder || r.nomorSalesOrder || "—"}
        </span>
      ),
    },
    {
      key: "barang", header: "Barang",
      render: (r: any) => (
        <div style={{ fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{r.namaBarang}</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{r.kodeBarang}</div>
        </div>
      ),
    },
    {
      key: "qty", header: "Qty",
      render: (r: any) => (
        <strong style={{ fontSize: 13.5, color: "#0f172a" }}>{r.quantity} {r.eum}</strong>
      ),
    },
    {
      key: "harga", header: "Total Harga",
      render: (r: any) => (
        <span style={{ fontWeight: 700, color: "#0f172a" }}>
          Rp {Number(r.totalHarga || 0).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "status", header: "Status",
      render: (r: any) => {
        const s = r.status || "—";
        const done = s === "Selesai";
        return (
          <span style={{ color: done ? "#16a34a" : "#94a3b8", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            {done && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />}
            {s}
          </span>
        );
      },
    },
    {
      key: "pic", header: "PIC (Admin)",
      render: (r: any) => (
        <span style={{ color: "#475569", fontWeight: 600, fontSize: 13 }}>{r.namaUser || r.userName}</span>
      ),
    },
  ];

  return (
    <div style={{ padding: "32px 40px", width: "100%", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5 }}>Riwayat Transaksi</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
            Lacak seluruh pergerakan barang masuk, keluar, hilang, dan rusak.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <TimeRangeFilter
            preset={preset} setPreset={setPreset}
            customStart={customStart} setCustomStart={setCustomStart}
            customEnd={customEnd} setCustomEnd={setCustomEnd}
          />
          <button
            onClick={handlePrintPDF}
            disabled={loading || rows.length === 0}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", fontSize: 13.5, fontWeight: 700,
              background: loading || rows.length === 0 ? "#e2e8f0" : "#0f172a",
              color: loading || rows.length === 0 ? "#94a3b8" : "#fff",
              border: "none", borderRadius: 10, cursor: loading || rows.length === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            🖨️ Cetak PDF
          </button>
        </div>
      </div>

      <DataTable<MovementData>
        title="Tabel Pergerakan Barang"
        rows={rows}
        columns={columns}
        rowKey={(r) => r.movementId ? r.movementId.toString() : `${r.kodeBarang}-${r.postingDate}-${Math.random()}`}
        loading={loading}
        search={{ placeholder: "Cari nomor dokumen atau barang...", keys: ["nomorPurchaseOrder", "nomorSalesOrder", "namaBarang", "kodeBarang"] }}
      />
    </div>
  );
}