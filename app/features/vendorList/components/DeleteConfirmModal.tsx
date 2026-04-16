"use client";

import styles from "@/styles/manajemenAkun.module.css";

type Props = {
  open: boolean;
  label: string;
  deleting: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
};

export default function DeleteConfirmModal({ open, label, deleting, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onCancel}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className={styles.modalHeader}>
          <h3>Konfirmasi Hapus</h3>
          <button className={styles.btnIcon} onClick={onCancel} disabled={deleting} type="button">✕</button>
        </div>

        <div style={{ padding: "20px" }}>
          <p style={{ margin: 0, color: "var(--color-text-primary)" }}>
            Yakin ingin menghapus <strong>{label}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className={styles.modalFooter} style={{ padding: "20px", borderTop: "1px solid #eee" }}>
          <button className={styles.btnGhost} onClick={onCancel} disabled={deleting} type="button">Batal</button>
          <button
            className={styles.btnPrimary}
            onClick={onConfirm}
            disabled={deleting}
            type="button"
            style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)" }}
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}