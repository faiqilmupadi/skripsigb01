// app/features/katalogBarang/components/TransformDetailModal.tsx
"use client";

import styles from "@/styles/manajemenAkun.module.css";

type Transform = {
  qtyFrom: number;
  eumFrom: string;
  qtyTo: number;
  eumTo: string;
};

type Props = {
  open: boolean;
  namaBarang: string;
  transforms: Transform[];
  onClose: () => void;
};

export default function TransformDetailModal({ open, namaBarang, transforms, onClose }: Props) {
  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className={styles.modalHeader}>
          <h3>Detail Transformasi: {namaBarang}</h3>
          <button className={styles.btnIcon} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.modalContent} style={{ padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Dari</th>
                <th style={{ padding: '8px' }}>Ke</th>
              </tr>
            </thead>
            <tbody>
              {transforms.length > 0 ? transforms.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{t.qtyFrom} {t.eumFrom}</td>
                  <td style={{ padding: '8px' }}>{t.qtyTo} {t.eumTo}</td>
                </tr>
              )) : (
                <tr><td colSpan={2} style={{ padding: '10px', textAlign: 'center' }}>Tidak ada data transformasi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.btnPrimary} onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}