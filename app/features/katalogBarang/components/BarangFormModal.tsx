"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/manajemenAkun.module.css";
import type { KatalogBarangRow } from "@/app/features/katalogBarang/types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: KatalogBarangRow | null;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
};

export default function BarangFormModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    baseOfMeasure: "",
    warna: "",
    leadtime: "",
    safetyStock: ""
  });

  const [transforms, setTransforms] = useState([{ qtyFrom: "", eumFrom: "", qtyTo: "", eumTo: "" }]);
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
        safetyStock: String(initial.safetyStock || "")
      });

      const existing = initial.allTransforms || [];
      if (existing.length > 0) {
        setTransforms(existing.map((t: any) => ({
          qtyFrom: String(t.qtyFrom),
          eumFrom: t.eumFrom,
          qtyTo: String(t.qtyTo),
          eumTo: t.eumTo
        })));
      } else {
        setTransforms([{ qtyFrom: "", eumFrom: "", qtyTo: "", eumTo: "" }]);
      }
    } else {
      setFormData({
        kodeBarang: "",
        namaBarang: "",
        baseOfMeasure: "",
        warna: "",
        leadtime: "",
        safetyStock: ""
      });
      setTransforms([{ qtyFrom: "", eumFrom: "", qtyTo: "", eumTo: "" }]);
    }
  }, [open, mode, initial]);

  const addTransform = () => setTransforms([...transforms, { qtyFrom: "", eumFrom: "", qtyTo: "", eumTo: "" }]);
  const removeTransform = (idx: number) => setTransforms(transforms.filter((_, i) => i !== idx));
  const updateTransform = (idx: number, field: string, val: string) => {
    const next = [...transforms];
    (next[idx] as any)[field] = val;
    setTransforms(next);
  };

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <div className={styles.modalHeader}>
          <h3>{mode === "edit" ? "Edit Katalog Barang" : "Pendaftaran Barang Baru"}</h3>
          <button className={styles.btnIcon} onClick={onClose} type="button">✕</button>
        </div>

        {err && <div className={styles.alertError} style={{ color: 'red', padding: '10px' }}>{err}</div>}

        <div className={styles.formGrid} style={{ maxHeight: '65vh', overflowY: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

          <div style={{ gridColumn: "1/-1", fontWeight: 'bold', borderBottom: '2px solid #f0f0f0', paddingBottom: '5px' }}>
            Data Master Barang
          </div>

          <label className={styles.label}>
            Kode Barang
            <input
              className={styles.input}
              value={formData.kodeBarang}
              onChange={e => setFormData({ ...formData, kodeBarang: e.target.value })}
              disabled={mode === "edit"}
              placeholder="BRG-001"
            />
          </label>

          <label className={styles.label}>
            Nama Barang
            <input
              className={styles.input}
              value={formData.namaBarang}
              onChange={e => setFormData({ ...formData, namaBarang: e.target.value })}
              placeholder="Laptop Asus..."
            />
          </label>

          <label className={styles.label}>
            Satuan Dasar (EuM)
            <input
              className={styles.input}
              value={formData.baseOfMeasure}
              onChange={e => setFormData({ ...formData, baseOfMeasure: e.target.value })}
              placeholder="Pcs / Dus"
            />
          </label>

          <label className={styles.label}>
            Warna
            <input
              className={styles.input}
              value={formData.warna}
              onChange={e => setFormData({ ...formData, warna: e.target.value })}
              placeholder="Hitam"
            />
          </label>

          <div style={{ gridColumn: "1/-1", fontWeight: 'bold', borderBottom: '2px solid #f0f0f0', paddingBottom: '5px', marginTop: '10px' }}>
            Reorder Point (ROP)
          </div>

          <label className={styles.label}>
            Leadtime (Hari)
            <input
              className={styles.input}
              type="number"
              value={formData.leadtime}
              onChange={e => setFormData({ ...formData, leadtime: e.target.value })}
              placeholder="7"
            />
          </label>

          <label className={styles.label}>
            Safety Stock
            <input
              className={styles.input}
              type="number"
              value={formData.safetyStock}
              onChange={e => setFormData({ ...formData, safetyStock: e.target.value })}
              placeholder="10"
            />
          </label>

          <div style={{ gridColumn: "1/-1", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Transformasi Satuan (Opsional)</span>
            <button type="button" onClick={addTransform} style={{ padding: '5px 15px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #28a745', color: '#28a745', background: '#fff' }}>
              + Tambah Baris
            </button>
          </div>

          {/* Bagian Loop Transformasi */}
          {transforms.map((t, i) => (
            <div
              key={i}
              style={{
                gridColumn: "1/-1",
                padding: '15px',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                background: '#fafafa',
                position: 'relative',
                marginBottom: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Konversi #{i + 1}</span>
                {transforms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTransform(i)}
                    style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ✕ Hapus
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: "1/-1", fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Dari Satuan Besar</div>
                <label className={styles.label}>
                  Qty
                  <input
                    className={styles.input}
                    type="number"
                    value={t.qtyFrom}
                    onChange={e => updateTransform(i, 'qtyFrom', e.target.value)}
                    placeholder="Contoh: 1"
                  />
                </label>
                <label className={styles.label}>
                  Satuan
                  <input
                    className={styles.input}
                    value={t.eumFrom}
                    onChange={e => updateTransform(i, 'eumFrom', e.target.value)}
                    placeholder="Contoh: Dus"
                  />
                </label>

                <div style={{ gridColumn: "1/-1", fontSize: '11px', color: '#888', textTransform: 'uppercase', marginTop: '5px' }}>Menjadi Satuan Kecil</div>
                <label className={styles.label}>
                  Qty
                  <input
                    className={styles.input}
                    type="number"
                    value={t.qtyTo}
                    onChange={e => updateTransform(i, 'qtyTo', e.target.value)}
                    placeholder="Contoh: 12"
                  />
                </label>
                <label className={styles.label}>
                  Satuan
                  <input
                    className={styles.input}
                    value={t.eumTo}
                    onChange={e => updateTransform(i, 'eumTo', e.target.value)}
                    placeholder="Contoh: Pcs"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.modalFooter} style={{ padding: '20px', borderTop: '1px solid #eee' }}>
          <button className={styles.btnGhost} onClick={onClose} disabled={saving} type="button">Batal</button>
          <button
            className={styles.btnPrimary}
            onClick={async () => {
              setSaving(true);
              try {
                const validTransforms = transforms.filter(t => t.qtyFrom && t.eumFrom && t.qtyTo && t.eumTo);
                await onSubmit({ ...formData, transforms: validTransforms });
              } catch (e: any) {
                setErr(e.message);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            type="button"
          >
            {saving ? "Menyimpan..." : "Simpan Barang"}
          </button>
        </div>
      </div>
    </div>
  );
}