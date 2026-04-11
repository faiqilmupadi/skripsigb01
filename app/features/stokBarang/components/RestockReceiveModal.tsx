// C:\Faiq\skripsi\skripsiku\app\features\stokBarang\components\RestockReceiveModal.tsx
"use client";

import React, { useMemo, useState } from "react";
import StockModal from "./StockModal";
import type { RestockNeedQCRow } from "@/app/features/stokBarang/types";
import styles from "@/styles/stokBarang.module.css";

type Props = {
  open: boolean;
  req: RestockNeedQCRow | null;
  onClose: () => void;
  onSubmit: (freeIn: number, blockedIn: number) => Promise<void>;
};

export default function RestockReceiveModal({ open, req, onClose, onSubmit }: Props) {
  const [freeIn, setFreeIn] = useState("");
  const [blockedIn, setBlockedIn] = useState("");
  const [saving, setSaving] = useState(false);

  const reqQty = useMemo(() => (req ? Number(req.requestedQty ?? 0) : 0), [req]);

  const submit = async () => {
    const f = Number(freeIn || 0);
    const b = Number(blockedIn || 0);

    if (!Number.isFinite(f) || f < 0) return alert("Free Stock masuk tidak valid");
    if (!Number.isFinite(b) || b < 0) return alert("Blocked Stock masuk tidak valid");

    const total = f + b;
    if (reqQty > 0 && total !== reqQty) {
      return alert(`Total QC (${total}) harus sama dengan Qty Request (${reqQty})`);
    }

    setSaving(true);
    try {
      await onSubmit(f, b);
      setFreeIn("");
      setBlockedIn("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <StockModal
      open={open}
      title="QC Barang Masuk (101)"
      subtitle={req ? `${req.partNumber} • ${req.plant} • PO: ${req.purchaseOrder} • Request: ${req.requestedQty}` : ""}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className={styles.btnGhost}>
            Batal
          </button>
          <button type="button" onClick={submit} disabled={saving} className={styles.btnPrimary}>
            {saving ? "Memproses..." : "Submit QC"}
          </button>
        </>
      }
    >
      <div className={styles.formGrid}>
        <div className={styles.listMeta}>
          Setelah submit QC: sistem update <b>material_stock.freeStock</b> dan <b>material_stock.blocked</b>.
        </div>

        <label className={styles.label}>Masuk ke Free Stock</label>
        <input
          className={styles.input}
          value={freeIn}
          onChange={(e) => setFreeIn(e.target.value)}
          placeholder={reqQty ? `contoh: ${reqQty}` : "contoh: 10"}
          inputMode="decimal"
        />

        <label className={styles.label}>Masuk ke Blocked Stock</label>
        <input
          className={styles.input}
          value={blockedIn}
          onChange={(e) => setBlockedIn(e.target.value)}
          placeholder="contoh: 0"
          inputMode="decimal"
        />

        <div className={styles.listMeta}>
          Total QC: <b>{(Number(freeIn || 0) + Number(blockedIn || 0)).toString()}</b>
          {reqQty ? (
            <>
              {" "}
              / Qty Request: <b>{reqQty}</b>
            </>
          ) : null}
        </div>
      </div>
    </StockModal>
  );
}
