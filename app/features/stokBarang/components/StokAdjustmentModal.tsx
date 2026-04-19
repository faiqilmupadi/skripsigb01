"use client";

import { StokBarang, AdjustmentType } from "../types";
import Form from "@/app/components/shared/Form";

type Props = {
  isOpen: boolean;
  selectedStok: StokBarang | null;
  tipe: AdjustmentType;
  setTipe: (t: AdjustmentType) => void;
  qty: number | "";
  setQty: (q: number | "") => void;
  maxQty: number;
  catatan: string;
  setCatatan: (c: string) => void;
  error: string | null;
  setError: (e: string | null) => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
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
  padding: "10px 13px",
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

const TIPE_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string; border: string }> = {
  Hilang: { emoji: "🔻", label: "Barang Hilang (Kurangi Fisik)", color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
  Rusak:  { emoji: "🔨", label: "Barang Rusak (Kurangi Fisik)",  color: "#9a3412", bg: "#fff7ed", border: "#fed7aa" },
  Ketemu: { emoji: "🔍", label: "Barang Ketemu (Tambah Fisik)",  color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
};

export default function StokAdjustmentModal({
  isOpen, selectedStok, tipe, setTipe, qty, setQty, maxQty,
  catatan, setCatatan, error, setError, saving, onClose, onSave,
}: Props) {
  if (!selectedStok) return null;
  const cfg = TIPE_CONFIG[tipe] ?? TIPE_CONFIG.Hilang;

  return (
    <Form
      open={isOpen}
      title="Penyesuaian Fisik (Adjustment)"
      subtitle={`${selectedStok.kodeBarang} — ${selectedStok.namaBarang}`}
      icon="⚙️"
      onClose={onClose}
      onSubmit={onSave}
      saving={saving}
      submitText="Eksekusi Penyesuaian"
      error={error}
      maxWidth="460px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Current stock info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Stok Siap", value: selectedStok.barangSiap, color: "#15803d" },
            { label: "Hilang",    value: selectedStok.barangHilang, color: selectedStok.barangHilang > 0 ? "#dc2626" : "#94a3b8" },
            { label: "Rusak",     value: selectedStok.barangRusak,  color: selectedStok.barangRusak > 0 ? "#ea580c" : "#94a3b8" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 12, border: "1.5px solid #e8edf5", textAlign: "center" }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: s.color }}>
                {s.value.toLocaleString("id-ID")}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{selectedStok.eum}</div>
            </div>
          ))}
        </div>

        {/* Jenis Kasus */}
        <div>
          <label style={fieldLabel}>Jenis Kasus</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(["Hilang", "Rusak", "Ketemu"] as AdjustmentType[]).map((t) => {
              const c = TIPE_CONFIG[t];
              const isSelected = tipe === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTipe(t); setQty(""); setError(null); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? c.border : "#e2e8f0"}`,
                    background: isSelected ? c.bg : "#f8fafc",
                    color: isSelected ? c.color : "#64748b",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{c.emoji}</span>
                  <span>{c.label}</span>
                  {isSelected && (
                    <span style={{ marginLeft: "auto", fontSize: 14, color: c.color }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kuantitas */}
        <div>
          <label style={fieldLabel}>
            Kuantitas ({selectedStok.eum})
          </label>
          <input
            type="number"
            min={1}
            max={maxQty}
            style={inputBase}
            placeholder={`Batas: ${maxQty.toLocaleString("id-ID")}`}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
          <span style={{ display: "block", marginTop: 5, fontSize: 12, color: "#64748b", fontWeight: 500 }}>
            Batas maksimal untuk kasus ini:{" "}
            <strong style={{ color: "#0f172a" }}>
              {maxQty.toLocaleString("id-ID")} {selectedStok.eum}
            </strong>
          </span>
        </div>

        {/* Catatan */}
        <div>
          <label style={fieldLabel}>Alasan / Catatan Penyesuaian (Wajib)</label>
          <textarea
            style={{ ...inputBase, resize: "vertical", minHeight: 80, lineHeight: 1.55 }}
            rows={3}
            placeholder="Contoh: Jatuh saat proses bongkar muat oleh tim A."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>

        {maxQty === 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, fontSize: 12.5, color: "#991b1b", fontWeight: 600 }}>
            ⚠️ Tidak ada stok yang dapat disesuaikan untuk kasus ini.
          </div>
        )}
      </div>
    </Form>
  );
}