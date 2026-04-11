"use client";

import React, { useMemo, useState } from "react";
import StockModal from "./StockModal";
import type { StockRow } from "@/app/features/stokBarang/types";
import styles from "@/styles/stokBarang.module.css";

type Props = {
  open: boolean;
  row: StockRow | null;
  onClose: () => void;
  onSubmit: (qty: number) => Promise<void>;
};

export default function ReturnModal({ open, row, onClose, onSubmit }: Props) {
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);
  const maxHint = useMemo(() => (row ? row.blockedStock : 0), [row]);

  const submit = async () => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return alert("Qty harus > 0");
    setSaving(true);
    try {
      await onSubmit(n);
      setQty("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <StockModal
      open={open}
      title="Return Barang (Z48)"
      subtitle={row ? `${row.partNumber} • ${row.plant} • Blocked: ${row.blockedStock}` : ""}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className={styles.btnGhost}>
            Batal
          </button>
          <button type="button" onClick={submit} disabled={saving} className={styles.btnPrimary}>
            {saving ? "Menyimpan..." : "Return"}
          </button>
        </>
      }
    >
      <div className={styles.formGrid}>
        <div className={styles.listMeta}>
          Z48 hanya mengurangi <b>blocked</b>. Movement quantity dicatat negatif.
        </div>

        <label className={styles.label}>Qty return (maks {maxHint})</label>
        <input className={styles.input} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="contoh: 2" />
      </div>
    </StockModal>
  );
}
