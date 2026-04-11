// C:\Faiq\skripsi\skripsiku\app\features\stokBarang\components\StockActionBar.tsx
"use client";

import React from "react";
import styles from "@/styles/stokBarang.module.css";

type Props = {
  lowStockCount: number;
  approvedCount: number; // tetap props lama biar ga bongkar banyak
  loading?: boolean;
  onRefresh: () => void;
  onOpenLowStock: () => void;
  onOpenApproved: () => void; // diarahkan ke list QC
};

export default function StockActionBar({
  lowStockCount,
  approvedCount,
  loading,
  onRefresh,
  onOpenLowStock,
  onOpenApproved,
}: Props) {
  return (
    <div className={styles.actionBar}>
      <div className={styles.actionLeft}>
        <button type="button" onClick={onRefresh} className={styles.btn}>
          {loading ? "Memuat..." : "Refresh"}
        </button>

        <button type="button" onClick={onOpenLowStock} className={styles.btn}>
          Low Stock <span className={styles.badge}>{lowStockCount}</span>
        </button>

        <button type="button" onClick={onOpenApproved} className={styles.btn}>
          Perlu QC <span className={styles.badge}>{approvedCount}</span>
        </button>
      </div>

      <div className={styles.actionHint}>Aksi: ↻ Restock (101), 🏠 Return (Z48), ✋ Ambil (261)</div>
    </div>
  );
}
