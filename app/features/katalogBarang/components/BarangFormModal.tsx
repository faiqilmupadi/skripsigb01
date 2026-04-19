"use client";

import { useEffect, useState } from "react";
import type { KatalogBarangRow } from "@/app/features/katalogBarang/types";
import Form from "@/app/components/shared/Form";

type TransformItem = {
  qtyFrom: string;
  eumFrom: string;
  qtyTo: string;
  eumTo: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: KatalogBarangRow | null;
  colorOptions: { kodeWarna: string; namaWarna: string }[];
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
};

export default function BarangFormModal({ open, mode, initial, colorOptions, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    baseOfMeasure: "",
    warna: "",
    leadtime: "",
    safetyStock: "",
  });
  const [transforms, setTransforms] = useState<TransformItem[]>([
    { qtyFrom: "", eumFrom: "", qtyTo: "", eumTo: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    if (mode === "edit" && initial) {
      setFormData({
        kodeBarang: initial.kodeBarang,
        namaBarang: initial.namaBarang,
        baseOfMeasure: initial.baseOfMeasure || "",
        warna: initial.warna || "",
        leadtime: String(initial.leadtime || ""),
        safetyStock: String(initial.safetyStock || ""),
      });
      const ex = initial.allTransforms || [];
      setTransforms(
        ex.length > 0
          ? ex.map((t) => ({
              qtyFrom: String(t.qtyFrom || ""),
              eumFrom: t.eumFrom || "",
              qtyTo: String(t.qtyTo || ""),
              eumTo: t.eumTo || "",
            }))
          : [{ qtyFrom: "", eumFrom: "", qtyTo: "", eumTo: "" }]
      );
    } else {
      setFormData({ kodeBarang: "", namaBarang: "", baseOfMeasure: "", warna: "", leadtime: "", safetyStock: "" });
      setTransforms([{ qtyFrom: "", eumFrom: "", qtyTo: "", eumTo: "" }]);
    }
  }, [open, mode, initial]);

  const addTransform = () =>
    setTransforms([...transforms, { qtyFrom: "", eumFrom: "", qtyTo: "", eumTo: "" }]);
  const removeTransform = (idx: number) =>
    setTransforms(transforms.filter((_, i) => i !== idx));
  const updateTransform = (idx: number, field: keyof TransformItem, val: string) => {
    const next = [...transforms];
    next[idx][field] = val;
    setTransforms(next);
  };

  const handleFormSubmit = async () => {
    setSaving(true);
    setErr(null);
    try {
      const validTransforms = transforms.filter((t) => t.qtyFrom && t.eumFrom && t.qtyTo && t.eumTo);
      await onSubmit({ ...formData, transforms: validTransforms });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Form
      open={open}
      title={mode === "edit" ? "Edit Katalog Barang" : "Pendaftaran Barang Baru"}
      subtitle="Isi informasi lengkap barang dan konversi satuan"
      icon="📦"
      onClose={onClose}
      onSubmit={handleFormSubmit}
      saving={saving}
      submitText={mode === "edit" ? "Simpan Perubahan" : "Daftarkan Barang"}
      error={err}
      maxWidth="720px"
    >
      {/* ── Section: Data Master ── */}
      <div className="fm-section-head" style={{ gridColumn: "1/-1" }}>
        <span>📋 Data Master Barang</span>
      </div>

      <div className="fm-grid-2">
        <div className="fm-field">
          <label className="fm-label">Kode Barang</label>
          <input
            className="fm-input"
            value={formData.kodeBarang}
            onChange={set("kodeBarang")}
            disabled={mode === "edit"}
            placeholder="BRG-001"
          />
          {mode === "edit" && <span className="fm-hint">Kode tidak dapat diubah setelah dibuat</span>}
        </div>

        <div className="fm-field">
          <label className="fm-label">Nama Barang</label>
          <input
            className="fm-input"
            value={formData.namaBarang}
            onChange={set("namaBarang")}
            placeholder="Contoh: Laptop Asus VivoBook"
          />
        </div>

        <div className="fm-field">
          <label className="fm-label">Satuan Dasar (EuM)</label>
          <input
            className="fm-input"
            value={formData.baseOfMeasure}
            onChange={set("baseOfMeasure")}
            placeholder="Pcs / Dus / Kg"
          />
        </div>

        <div className="fm-field">
          <label className="fm-label">Warna</label>
          <select
            className="fm-input fm-select"
            value={formData.warna}
            onChange={set("warna")}
          >
            <option value="">— Pilih Warna —</option>
            {colorOptions?.map((c) => (
              <option key={c.kodeWarna} value={c.namaWarna}>
                {c.namaWarna}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Section: ROP ── */}
      <div className="fm-section-head" style={{ marginTop: 20 }}>
        <span>📊 Reorder Point (ROP)</span>
      </div>

      <div className="fm-grid-2">
        <div className="fm-field">
          <label className="fm-label">Leadtime (Hari)</label>
          <input
            className="fm-input"
            type="number"
            value={formData.leadtime}
            onChange={set("leadtime")}
            placeholder="7"
            min="0"
          />
          <span className="fm-hint">Rata-rata waktu tunggu dari pemesanan ke penerimaan</span>
        </div>

        <div className="fm-field">
          <label className="fm-label">Safety Stock</label>
          <input
            className="fm-input"
            type="number"
            value={formData.safetyStock}
            onChange={set("safetyStock")}
            placeholder="10"
            min="0"
          />
          <span className="fm-hint">Stok cadangan minimum sebelum reorder</span>
        </div>
      </div>

      {/* ── Section: Transformasi ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <div className="fm-section-head" style={{ flex: 1, marginBottom: 0 }}>
          <span>🔄 Transformasi Satuan</span>
        </div>
        <button
          type="button"
          onClick={addTransform}
          style={{
            marginLeft: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 700,
            border: "1.5px solid #bbf7d0",
            borderRadius: 8,
            background: "#f0fdf4",
            color: "#15803d",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          + Tambah Baris
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
        {transforms.map((t, i) => (
          <div
            key={i}
            style={{
              padding: "16px 18px",
              border: "1.5px solid #e8edf5",
              borderRadius: 14,
              background: "#fafbff",
              position: "relative",
            }}
          >
            {/* Row header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#6366f1",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  background: "#eff0fe",
                  padding: "3px 9px",
                  borderRadius: 6,
                }}
              >
                Konversi #{i + 1}
              </span>
              {transforms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTransform(i)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    border: "1.5px solid #fecaca",
                    borderRadius: 7,
                    background: "#fef2f2",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ✕ Hapus
                </button>
              )}
            </div>

            {/* Two columns: FROM and TO */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "end" }}>
              {/* FROM */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Dari (Satuan Besar)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8 }}>
                  <div className="fm-field">
                    <label className="fm-label">Qty</label>
                    <input
                      className="fm-input"
                      type="number"
                      value={t.qtyFrom}
                      onChange={(e) => updateTransform(i, "qtyFrom", e.target.value)}
                      placeholder="1"
                      min="0"
                    />
                  </div>
                  <div className="fm-field">
                    <label className="fm-label">Satuan</label>
                    <input
                      className="fm-input"
                      value={t.eumFrom}
                      onChange={(e) => updateTransform(i, "eumFrom", e.target.value)}
                      placeholder="Dus"
                    />
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 20, color: "#6366f1", paddingBottom: 6, alignSelf: "end", lineHeight: 1 }}>→</div>

              {/* TO */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Menjadi (Satuan Kecil)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8 }}>
                  <div className="fm-field">
                    <label className="fm-label">Qty</label>
                    <input
                      className="fm-input"
                      type="number"
                      value={t.qtyTo}
                      onChange={(e) => updateTransform(i, "qtyTo", e.target.value)}
                      placeholder="12"
                      min="0"
                    />
                  </div>
                  <div className="fm-field">
                    <label className="fm-label">Satuan</label>
                    <input
                      className="fm-input"
                      value={t.eumTo}
                      onChange={(e) => updateTransform(i, "eumTo", e.target.value)}
                      placeholder="Pcs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {transforms.length === 0 && (
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "16px 0 4px" }}>
          Tidak ada transformasi. Klik <strong>+ Tambah Baris</strong> untuk menambah.
        </p>
      )}
    </Form>
  );
}