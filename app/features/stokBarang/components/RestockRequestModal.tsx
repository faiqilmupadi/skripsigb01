"use client";

import React, { useMemo, useState } from "react";
import StockModal from "./StockModal";
import type { StockRow } from "@/app/features/stokBarang/types";
import styles from "@/styles/stokBarang.module.css";

type Props = {
  open: boolean;
  row: StockRow | null;
  suggestedQty?: number;
  onClose: () => void;
  onSubmit: (reqQty: number) => Promise<void>;
};

export default function RestockRequestModal({ open, row, suggestedQty, onClose, onSubmit }: Props) {
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);

  const defaultHint = useMemo(() => {
    if (Number.isFinite(suggestedQty ?? NaN) && (suggestedQty ?? 0) > 0) return String(suggestedQty);
    return row?.reorderPoint ? String(row.reorderPoint) : "";
  }, [row, suggestedQty]);

  const submit = async () => {
    const n = Number(qty || defaultHint);
    if (!Number.isFinite(n) || n <= 0) return alert("Qty request harus > 0");
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
      title="Request Restock (101)"
      subtitle={row ? `${row.partNumber} • ${row.plant}` : ""}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className={styles.btnGhost}>
            Batal
          </button>
          <button type="button" onClick={submit} disabled={saving} className={styles.btnPrimary}>
            {saving ? "Mengirim..." : "Kirim Request"}
          </button>
        </>
      }
    >
      <div className={styles.formGrid}>
        <label className={styles.label}>Qty restock diminta</label>
        <input
          className={styles.input}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder={defaultHint ? `contoh: ${defaultHint}` : "contoh: 10"}
        />
        <div className={styles.listMeta}>
          Request membuat row <b>movementType=101</b> dengan <b>quantity=0</b> sampai approve & receive.
        </div>
      </div>
    </StockModal>
  );
}
