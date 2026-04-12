// app/features/katalogBarang/components/ConfirmDeleteBarangModal.tsx
"use client";

import { useState } from "react";
import styles from "@/styles/manajemenAkun.module.css";

// Pastikan tipe Props ini memiliki 'open'
type Props = {
  open: boolean;
  label: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function ConfirmDeleteBarangModal({ open, label, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Konfirmasi Hapus</h3>
          <button className={styles.btnIcon} onClick={onClose} aria-label="Close" type="button">
            ✕
          </button>
        </div>

        <p className={styles.modalText}>
          Yakin untuk menghapus <b>{label}</b>?
        </p>

        <div className={styles.modalFooter}>
          <button className={styles.btnGhost} onClick={onClose} disabled={loading} type="button">
            Batal
          </button>
          <button
            className={styles.btnDanger}
            disabled={loading}
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                await onConfirm();
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Menghapus…" : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}