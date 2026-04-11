"use client";

import React from "react";
import styles from "@/styles/stokBarang.module.css";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function StockModal({ open, title, subtitle, onClose, children, footer }: Props) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>{title}</div>
            {subtitle ? <div className={styles.modalSubtitle}>{subtitle}</div> : null}
          </div>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>{children}</div>

        {footer ? <div className={styles.modalFooter}>{footer}</div> : null}
      </div>
    </div>
  );
}
