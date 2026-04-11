// app/features/manajemenAkun/components/ConfirmDeleteModal.tsx
"use client";

import { useState } from "react";
import styles from "@/styles/manajemenAkun.module.css";

type Props = {
  open: boolean;
  username: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function ConfirmDeleteModal({ open, username, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Konfirmasi Hapus</h3>
          <button className={styles.btnIcon} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className={styles.modalText}>
          Yakin hapus user <b>{username}</b>?
        </p>

        <div className={styles.modalFooter}>
          <button className={styles.btnGhost} onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button
            className={styles.btnDanger}
            disabled={loading}
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
