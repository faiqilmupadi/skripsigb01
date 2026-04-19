"use client";

import Form from "@/app/components/shared/Form";
import { SalesOrderFormData, BarangOption, TransformEum } from "../types";

type Props = {
  open: boolean;
  saving: boolean;
  error: string | null;
  form: SalesOrderFormData;
  barangList: BarangOption[];
  transformList: TransformEum[];
  onClose: () => void;
  onSubmit: () => Promise<void>;
  handleItemChange: (index: number, kodeBarang: string) => void;
  handleEumChange: (index: number, eum: string) => void;
  handleQtyChange: (index: number, qty: number) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  getMultiplier: (kode: string, from: string, to: string) => number;
};

const fieldLabel: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: "#374151",
  letterSpacing: 0.2,
  textTransform: "uppercase",
  display: "block",
  marginBottom: 6,
};

const inputBase: React.CSSProperties = {
  padding: "9px 12px",
  fontSize: 13.5,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 500,
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  background: "#f8fafc",
  color: "#0f172a",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const selectBase: React.CSSProperties = {
  ...inputBase,
  appearance: "none",
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
  cursor: "pointer",
};

export default function SalesOrderForm({
  open, saving, error, form, barangList, transformList,
  onClose, onSubmit, handleItemChange, handleEumChange, handleQtyChange, addItem, removeItem, getMultiplier,
}: Props) {
  const grandTotal = form.items.reduce((s, i) => s + i.totalHarga, 0);

  return (
    <Form
      open={open}
      title="Buat Sales Order Baru"
      subtitle="Pengeluaran barang dari gudang"
      icon="🚚"
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      submitText="Simpan & Potong Stok"
      error={error}
      maxWidth="900px"
    >
      {/* Warning */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "11px 14px",
        background: "#eff6ff",
        border: "1.5px solid #bfdbfe",
        borderRadius: 12,
        color: "#1e40af",
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.55,
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <span>
          <strong>Perhatian:</strong> Menyimpan form ini akan langsung <strong>memotong stok fisik Gudang</strong> secara permanen dan tidak dapat dibatalkan.
        </span>
      </div>

      {/* Items header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="fm-section-head" style={{ flex: 1, marginBottom: 0 }}>
          <span>📋 Daftar Pengeluaran Barang</span>
        </div>
        <button
          type="button"
          onClick={addItem}
          style={{
            marginLeft: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 700,
            border: "1.5px solid #c7d2fe",
            borderRadius: 8,
            background: "#eef2ff",
            color: "#4f46e5",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          + Tambah Baris
        </button>
      </div>

      {form.items.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "28px 0", background: "#f8fafc", borderRadius: 12, border: "1.5px dashed #e2e8f0", fontSize: 13.5 }}>
          Keranjang kosong. Klik <strong>+ Tambah Baris</strong> untuk menambah barang.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {form.items.map((item, idx) => {
            const selectedBarang = barangList.find((b) => b.kodeBarang === item.kodeBarang);
            const multiplierToBase = selectedBarang
              ? getMultiplier(item.kodeBarang, item.eum, selectedBarang.baseEum)
              : 1;
            const maxStok = selectedBarang
              ? Math.floor(selectedBarang.barangSiap / multiplierToBase)
              : 999999;
            const isOver = item.qty > maxStok;

            const availableEums = selectedBarang
              ? Array.from(
                  new Set([
                    selectedBarang.baseEum,
                    ...transformList.filter((t) => t.kodeBarang === item.kodeBarang).map((t) => t.eumFrom),
                    ...transformList.filter((t) => t.kodeBarang === item.kodeBarang).map((t) => t.eumTo),
                  ])
                )
              : [];

            return (
              <div
                key={idx}
                style={{
                  padding: "14px 16px",
                  background: isOver ? "#fff5f5" : "#fafbff",
                  border: `1.5px solid ${isOver ? "#fecaca" : "#e8edf5"}`,
                  borderRadius: 14,
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                {/* Row 1: Pilih Barang */}
                <div style={{ marginBottom: 10 }}>
                  <label style={fieldLabel}>Pilih Barang</label>
                  <select
                    style={selectBase}
                    value={item.kodeBarang}
                    onChange={(e) => handleItemChange(idx, e.target.value)}
                  >
                    <option value="">— Pilih Barang —</option>
                    {barangList.map((b) => (
                      <option key={b.kodeBarang} value={b.kodeBarang}>
                        {b.kodeBarang} — {b.namaBarang} (Tersedia: {b.barangSiap} {b.baseEum})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 2: Satuan + Qty + Subtotal + Hapus */}
                {item.kodeBarang && (
                  <div style={{ display: "grid", gridTemplateColumns: "130px 110px 1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={fieldLabel}>Satuan</label>
                      <select
                        style={selectBase}
                        value={item.eum}
                        onChange={(e) => handleEumChange(idx, e.target.value)}
                      >
                        {availableEums.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ ...fieldLabel, color: isOver ? "#ef4444" : "#374151" }}>
                        Qty Keluar
                        {isOver && (
                          <span style={{ marginLeft: 6, fontSize: 11, color: "#ef4444", textTransform: "none", fontWeight: 700 }}>
                            (Maks: {maxStok})
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={maxStok}
                        style={{
                          ...inputBase,
                          borderColor: isOver ? "#ef4444" : "#e2e8f0",
                          boxShadow: isOver ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
                        }}
                        value={item.qty}
                        onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label style={fieldLabel}>Subtotal Harga</label>
                      <div style={{ padding: "9px 12px", background: "#f1f5f9", borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: "#0f172a", border: "1.5px solid #e2e8f0" }}>
                        Rp {item.totalHarga.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      style={{
                        width: 36, height: 36,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "#fef2f2", border: "1.5px solid #fecaca",
                        borderRadius: 9, cursor: "pointer", fontSize: 14, color: "#dc2626",
                        fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {isOver && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#dc2626", fontWeight: 700 }}>
                    ⚠️ Qty melebihi stok tersedia. Maksimal {maxStok} {item.eum}.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Grand Total */}
      {form.items.length > 0 && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 14, padding: "14px 18px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: 12, color: "#fff",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.75 }}>Estimasi Nilai Transaksi</span>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
            Rp {grandTotal.toLocaleString("id-ID")}
          </span>
        </div>
      )}
    </Form>
  );
}