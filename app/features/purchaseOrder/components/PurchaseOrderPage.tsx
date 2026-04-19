// C:\faiq\skripsi\skripsigb01\app\features\purchaseOrder\components\PurchaseOrderPage.tsx
"use client";

import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import PurchaseOrderForm from "./PurchaseOrderForm";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import { PurchaseOrderGroup } from "../types";
import { sharedStyles } from "@/app/components/shared/UIStyles";

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  "Sudah Dipesan":              { bg: "#e0f2fe", color: "#0369a1", dot: "#38bdf8" },
  "Sedang Dikemas":             { bg: "#fef9c3", color: "#854d0e", dot: "#facc15" },
  "Sedang Dalam Pengiriman":    { bg: "#ffedd5", color: "#c2410c", dot: "#fb923c" },
  "Selesai":                    { bg: "#dcfce7", color: "#166534", dot: "#4ade80" },
};

export default function PurchaseOrderPage() {
  const po = usePurchaseOrder();

  const columns: DataTableColumn<PurchaseOrderGroup>[] = [
    { key: "nomorPurchaseOrder", header: "Nomor PO", accessor: "nomorPurchaseOrder", width: 150 },
    { key: "tanggal", header: "Tanggal", accessor: "tanggal", width: 120 },
    { key: "vendor", header: "Vendor", accessor: "namaVendor" },
    { key: "pic", header: "PIC (Admin)", accessor: "penanggungJawab", width: 140 },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
        const s = row.status;
        const cfg = statusConfig[s] ?? { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: cfg.bg, color: cfg.color,
            padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            {s}
          </span>
        );
      },
    },
    {
      key: "total", header: "Total Tagihan",
      render: (row: any) => (
        <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
          Rp {Number(row.totalSemuaHarga || 0).toLocaleString("id-ID")}
        </span>
      ),
    },
  ];

  return (
    <div style={sharedStyles.pageWrapper}>
      {/* Header */}
      <div style={sharedStyles.headerContainer}>
        <div>
          <h1 style={sharedStyles.pageTitle}>Purchase Order</h1>
          <p style={sharedStyles.pageSubtitle}>
            Kelola pemesanan dan konversi penerimaan barang dari Vendor
          </p>
        </div>
        <button
          onClick={() => po.setFormOpen(true)}
          style={{ ...sharedStyles.btnBase, ...sharedStyles.btnPrimary, alignSelf: "flex-start" }}
        >
          + Buat PO Baru
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <TimeRangeFilter
          preset={po.timePreset}
          setPreset={po.setTimePreset}
          customStart={po.customStart}
          setCustomStart={po.setCustomStart}
          customEnd={po.customEnd}
          setCustomEnd={po.setCustomEnd}
        />
      </div>

      <DataTable<PurchaseOrderGroup>
        title="Riwayat Pesanan"
        rows={po.rows}
        columns={columns}
        rowKey={(r) => r.nomorPurchaseOrder}
        loading={po.loading}
        search={{ placeholder: "Cari nomor PO atau Vendor...", keys: ["nomorPurchaseOrder", "namaVendor"] }}
        actionsHeader="Aksi"
        renderActions={(row) => {
          const isReceivable = row.status === "Sedang Dalam Pengiriman";
          return (
            <>
              <button
                onClick={() => po.openReceiveModal(row)}
                disabled={!isReceivable}
                style={{
                  ...sharedStyles.btnBase,
                  background: isReceivable ? "#f0fdf4" : "#f8fafc",
                  borderColor: isReceivable ? "#bbf7d0" : "#e2e8f0",
                  color: isReceivable ? "#15803d" : "#94a3b8",
                  cursor: isReceivable ? "pointer" : "not-allowed",
                  opacity: isReceivable ? 1 : 0.6,
                }}
              >
                📥 Terima
              </button>
              <button
                onClick={() => po.setViewTarget(row)}
                style={{ ...sharedStyles.btnBase, background: "#f8fafc", borderColor: "#e2e8f0", color: "#475569" }}
              >
                👁️ Detail
              </button>
            </>
          );
        }}
      />

      <PurchaseOrderForm
        open={po.formOpen} saving={po.saving} error={po.error} form={po.form}
        vendors={po.vendors} vendorLists={po.vendorLists}
        onClose={() => po.setFormOpen(false)} onSubmit={po.handleSave} setForm={po.setForm}
        handleVendorChange={po.handleVendorChange} handleItemChange={po.handleItemChange}
        handleQtyChange={po.handleQtyChange} addItem={po.addItem} removeItem={po.removeItem}
      />

      <PurchaseOrderDetail data={po.viewTarget} onClose={() => po.setViewTarget(null)} />

      {/* Modal Terima Barang (Retained Original Structure) */}
      {po.receiveTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, backdropFilter: "blur(2px)" }}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 700, boxShadow: "0 20px 60px -10px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              Terima Barang: {po.receiveTarget.nomorPurchaseOrder}
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13.5 }}>
              Sistem telah melakukan perhitungan <b>konversi otomatis</b>. Silakan hitung fisik barang dalam <b>satuan terkecil</b>.
            </p>

            <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead style={{ background: "#f1f5f9", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    {["Barang", "Dipesan", "Ekspektasi Konversi", "Fisik Aktual"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: "#7c8fa6" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {po.receiveItems.map((item, idx) => {
                    const isOver = item.qtyDiterima > item.qtyPesanBase;
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0", background: isOver ? "#fef2f2" : "transparent" }}>
                        <td style={{ padding: "12px 14px" }}>{item.kodeBarang} — {item.namaBarang}</td>
                        <td style={{ padding: "12px 14px" }}>{item.qtyPesanAsli} {item.eumAsli}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0369a1" }}>
                          {item.qtyPesanBase.toLocaleString("id-ID")} {item.eum}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number" min="0"
                              style={{
                                padding: "6px 8px", width: 80, textAlign: "center", fontSize: 13,
                                border: `1.5px solid ${isOver ? "#ef4444" : "#cbd5e1"}`,
                                borderRadius: 8, color: isOver ? "#b91c1c" : "#0f172a", fontWeight: 700,
                                outline: "none", fontFamily: "inherit",
                              }}
                              value={item.qtyDiterima}
                              onChange={(e) => po.handleReceiveQtyChange(idx, Number(e.target.value))}
                            />
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.eum}</span>
                          </div>
                          {isOver && (
                            <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4, fontWeight: 700 }}>
                              ⚠️ Kelebihan (+{item.qtyDiterima - item.qtyPesanBase})
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Catatan / Berita Acara (Wajib jika ada selisih)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Datang 950 Pcs (Terdapat 50 Pcs cacat produksi / botol pecah)."
                value={po.receiveCatatan}
                onChange={(e) => po.setReceiveCatatan(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: "1.5px solid #e2e8f0", borderRadius: 10, resize: "none", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {po.isOverReceiving && (
              <div style={{ padding: 14, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, color: "#b45309", fontSize: 13, display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span><strong>Peringatan:</strong> Anda memasukkan fisik aktual yang <b>melebihi</b> ekspektasi konversi. Pastikan surat jalan dari Vendor valid.</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => po.setReceiveTarget(null)}
                style={{ ...sharedStyles.btnBase, background: "#f8fafc", borderColor: "#e2e8f0", color: "#475569", padding: "9px 20px" }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={po.handleReceivePO}
                disabled={po.isReceiving}
                style={{
                  ...sharedStyles.btnBase,
                  padding: "9px 20px",
                  background: po.isReceiving ? "#86efac" : "#16a34a",
                  borderColor: "transparent",
                  color: "#fff",
                  cursor: po.isReceiving ? "not-allowed" : "pointer",
                  fontSize: 13.5,
                }}
              >
                {po.isReceiving ? "Menyimpan…" : "Selesaikan Penerimaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}