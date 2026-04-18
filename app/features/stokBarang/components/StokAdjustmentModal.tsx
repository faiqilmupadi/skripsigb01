"use client";

import { StokBarang, AdjustmentType } from "../types";
import styles from "@/styles/manajemenAkun.module.css";

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

export default function StokAdjustmentModal({
  isOpen, selectedStok, tipe, setTipe, qty, setQty, maxQty,
  catatan, setCatatan, error, setError, saving, onClose, onSave
}: Props) {
  if (!isOpen || !selectedStok) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "white", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: 20, color: "#0f172a" }}>Penyesuaian Fisik (Adjustment)</h3>
        <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: 13 }}>
          Barang: <strong>{selectedStok.kodeBarang} - {selectedStok.namaBarang}</strong>
        </p>

        {error && (
           <div style={{ padding: 12, background: "#fef2f2", color: "#991b1b", borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #fecaca" }}>
             ⚠️ {error}
           </div>
        )}

        <div className={styles.formGroup} style={{ marginBottom: 16 }}>
          <label className={styles.label}>Jenis Kasus</label>
          <select 
            className={styles.input} 
            value={tipe} 
            onChange={(e) => {
              setTipe(e.target.value as AdjustmentType);
              setQty(""); 
              setError(null);
            }}
          >
            <option value="Hilang">🔻 Barang Hilang (Kurangi Fisik)</option>
            <option value="Rusak">🔨 Barang Rusak (Kurangi Fisik)</option>
            <option value="Ketemu">🔍 Barang Ketemu (Tambah Fisik)</option>
          </select>
        </div>

        <div className={styles.formGroup} style={{ marginBottom: 16 }}>
          <label className={styles.label}>Kuantitas ({selectedStok.eum})</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input 
              type="number" 
              min="1" 
              max={maxQty}
              className={styles.input} 
              placeholder={`Maksimal: ${maxQty}`}
              value={qty} 
              onChange={(e) => setQty(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
          <small style={{ display: "block", marginTop: 6, color: "#64748b" }}>
            *Batas maksimal untuk kasus ini adalah <strong>{maxQty.toLocaleString('id-ID')} {selectedStok.eum}</strong>.
          </small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Alasan / Catatan Penyesuaian (Wajib)</label>
          <textarea 
            className={styles.input} 
            rows={3} 
            placeholder="Contoh: Jatuh saat proses bongkar muat oleh tim A."
            value={catatan} 
            onChange={(e) => setCatatan(e.target.value)} 
            style={{ resize: "none" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} className={styles.btnGhost} style={{ padding: "10px 20px", borderRadius: "8px" }}>Batal</button>
          <button 
            type="button" 
            onClick={onSave} 
            disabled={saving || maxQty === 0}
            style={{ 
              padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", 
              fontWeight: 600, cursor: saving || maxQty === 0 ? "not-allowed" : "pointer", opacity: saving || maxQty === 0 ? 0.6 : 1 
            }}
          >
            {saving ? "Menyimpan..." : "Eksekusi Penyesuaian"}
          </button>
        </div>
      </div>
    </div>
  );
}