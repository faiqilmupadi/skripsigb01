"use client";

import Form from "@/app/components/shared/Form";
import { PurchaseOrderFormData, VendorOption, VendorListOption } from "../types";

type Props = {
  open: boolean;
  saving: boolean;
  error: string | null;
  form: PurchaseOrderFormData;
  vendors: VendorOption[];
  vendorLists: VendorListOption[];
  onClose: () => void;
  onSubmit: () => Promise<void>;
  setForm: React.Dispatch<React.SetStateAction<PurchaseOrderFormData>>;
  handleVendorChange: (kodeVendor: string) => void;
  handleItemChange: (index: number, kodeBarang: string) => void;
  handleQtyChange: (index: number, qty: number) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
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
  transition: "border-color 0.15s, box-shadow 0.15s",
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

export default function PurchaseOrderForm({
  open, saving, error, form, vendors, vendorLists,
  onClose, onSubmit, handleVendorChange, handleItemChange, handleQtyChange, addItem, removeItem,
}: Props) {
  const availableBarang = vendorLists.filter((v) => v.kodeVendor === form.kodeVendor);
  const grandTotal = form.items.reduce((s, i) => s + i.totalHarga, 0);

  return (
    <Form
      open={open}
      title="Buat Purchase Order Baru"
      subtitle="Pemesanan barang kepada vendor"
      icon="🛒"
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      submitText="Buat Purchase Order"
      error={error}
      maxWidth="860px"
    >
      {/* ── Pilih Vendor ── */}
      <div>
        <label style={fieldLabel}>Vendor</label>
        <select style={selectBase} value={form.kodeVendor} onChange={(e) => handleVendorChange(e.target.value)}>
          <option value="">— Pilih Vendor —</option>
          {vendors.map((v) => (
            <option key={v.kodeVendor} value={v.kodeVendor}>
              {v.kodeVendor} — {v.namaVendor}
            </option>
          ))}
        </select>
      </div>

      {/* ── Item list ── */}
      {form.kodeVendor && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="fm-section-head" style={{ flex: 1, marginBottom: 0 }}>
              <span>📦 Daftar Pesanan</span>
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
              + Tambah Barang
            </button>
          </div>

          {form.items.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "28px 0", background: "#f8fafc", borderRadius: 12, border: "1.5px dashed #e2e8f0", fontSize: 13.5 }}>
              Belum ada barang. Klik <strong>+ Tambah Barang</strong> untuk memulai.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "14px 16px",
                    background: "#fafbff",
                    border: "1.5px solid #e8edf5",
                    borderRadius: 14,
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
                      {availableBarang.map((b) => (
                        <option key={b.kodeBarang} value={b.kodeBarang}>
                          {b.kodeBarang} — {b.namaBarang} (Satuan: {b.eum})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 2: Qty + Konversi + Subtotal + Hapus */}
                  {item.kodeBarang && (
                    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr auto", gap: 10, alignItems: "end" }}>
                      <div>
                        <label style={fieldLabel}>Qty ({item.eum})</label>
                        <input
                          type="number"
                          min={1}
                          style={inputBase}
                          value={item.qty}
                          onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label style={fieldLabel}>Estimasi Konversi</label>
                        <div style={{ padding: "9px 12px", background: "#eff6ff", borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: "#0369a1", border: "1.5px solid #bae6fd" }}>
                          = {(item.baseQty || 0).toLocaleString("id-ID")} {item.baseEum}
                        </div>
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
                </div>
              ))}
            </div>
          )}

          {/* Grand Total */}
          {form.items.length > 0 && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: 14, padding: "14px 18px",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: 12,
              color: "#fff",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.75 }}>Grand Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
                Rp {grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>
      )}
    </Form>
  );
}