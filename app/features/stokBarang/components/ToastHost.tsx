"use client";

import React from "react";
import styles from "@/styles/stokBarang.module.css";
import type { ToastItem } from "@/app/features/stokBarang/hooks/useToast";

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export default function ToastHost({ toasts, onDismiss }: Props) {
  if (!toasts.length) return null;

  return (
    <div className={styles.toastStack}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toastCard}>
          <div className={styles.toastTop}>
            <div className={styles.toastTitle}>{t.title}</div>
            <button type="button" className={styles.toastX} onClick={() => onDismiss(t.id)}>
              ✕
            </button>
          </div>
          <div className={styles.toastMsg}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}
