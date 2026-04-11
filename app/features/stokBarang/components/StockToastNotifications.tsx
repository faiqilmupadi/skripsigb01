"use client";

import React from "react";
import styles from "@/styles/stokBarang.module.css";

export type ToastItem = {
  id: string;
  title: string;
  desc: string;
  pills?: string[];
  onClick: () => void;
};

type Props = {
  items: ToastItem[];
  onDismiss: (id: string) => void; // dismiss sementara (state saja)
};

export default function StockToastNotifications({ items, onDismiss }: Props) {
  if (!items.length) return null;

  return (
    <div className={styles.toastStack} aria-live="polite" aria-relevant="additions">
      {items.map((t) => (
        <div
          key={t.id}
          className={styles.toast}
          role="button"
          tabIndex={0}
          onClick={() => t.onClick()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") t.onClick();
          }}
        >
          <div className={styles.toastTop}>
            <div>
              <div className={styles.toastTitle}>{t.title}</div>
              <div className={styles.toastDesc}>{t.desc}</div>

              {t.pills?.length ? (
                <div className={styles.toastPillRow}>
                  {t.pills.map((p, idx) => (
                    <span className={styles.pill} key={idx}>
                      {p}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className={styles.toastClose}
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation(); // jangan trigger onClick toast
                onDismiss(t.id);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
