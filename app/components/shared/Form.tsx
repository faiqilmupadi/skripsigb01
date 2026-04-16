import React from "react";
import styles from "@/styles/manajemenAkun.module.css";

type FormProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  saving?: boolean;
  submitText?: string;
  error?: string | null;
  children: React.ReactNode;
  maxWidth?: string;
};

export default function Form({
  open,
  title,
  onClose,
  onSubmit,
  saving = false,
  submitText = "Simpan",
  error,
  children,
  maxWidth = "500px"
}: FormProps) {
  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth }}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.btnIcon} onClick={onClose} type="button" disabled={saving}>
            ✕
          </button>
        </div>

        {error && (
          <div className={styles.alertError} style={{ color: 'red', padding: '10px' }}>
            {error}
          </div>
        )}

        <div 
          className={styles.formGrid} 
          style={{ 
            maxHeight: '65vh', 
            overflowY: 'auto', 
            padding: '20px', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px' 
          }}
        >
          {children}
        </div>

        <div className={styles.modalFooter} style={{ padding: '20px', borderTop: '1px solid #eee' }}>
          <button className={styles.btnGhost} onClick={onClose} disabled={saving} type="button">
            Batal
          </button>
          <button
            className={styles.btnPrimary}
            onClick={onSubmit}
            disabled={saving}
            type="button"
          >
            {saving ? "Menyimpan..." : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}