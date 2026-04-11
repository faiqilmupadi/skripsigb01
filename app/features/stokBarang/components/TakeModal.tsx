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

export default function TakeModal({ open, row, onClose, onSubmit }: Props) {
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);
  const maxHint = useMemo(() => (row ? row.freeStock : 0), [row]);

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
      title="Ambil Barang (261)"
      subtitle={row ? `${row.partNumber} • ${row.plant} • FreeStock: ${row.freeStock}` : ""}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className={styles.btnGhost}>
            Batal
          </button>
          <button type="button" onClick={submit} disabled={saving} className={styles.btnPrimary}>
            {saving ? "Menyimpan..." : "Ambil"}
          </button>
        </>
      }
    >
      <div className={styles.formGrid}>
        <div className={styles.listMeta}>
          Sistem akan mengurangi <b>freeStock</b> dan mencatat <b>movementType=261</b> dengan quantity negatif.
        </div>

        <label className={styles.label}>Qty ambil (maks {maxHint})</label>
        <input className={styles.input} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="contoh: 5" />
      </div>
    </StockModal>
  );
}
