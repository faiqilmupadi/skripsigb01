// C:\Faiq\skripsi\skripsiku\app\features\stokBarang\components\StokBarangClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import { useStokBarang } from "@/app/features/stokBarang/hooks/useStokBarang";
import type { LowStockRow, RestockNeedQCRow, StockRow } from "@/app/features/stokBarang/types";

import StockActionBar from "./StockActionBar";
import StockModal from "./StockModal";
import TakeModal from "./TakeModal";
import ReturnModal from "./ReturnModal";
import RestockRequestModal from "./RestockRequestModal";
import RestockReceiveModal from "./RestockReceiveModal";
import StockToastNotifications, { ToastItem } from "./StockToastNotifications";

import styles from "@/styles/stokBarang.module.css";

function notify(msg: string) {
  alert(msg);
}

export default function StokBarangClient() {
  // ✅ IMPORTANT: hook harus return needQC (bukan approvedRestocks)
  const { rows, lowStock, needQC, loading, notifLoading, error, refresh, refreshNotifications, actions } =
    useStokBarang();

  const [selectedRow, setSelectedRow] = useState<StockRow | null>(null);
  const [selectedNeedQC, setSelectedNeedQC] = useState<RestockNeedQCRow | null>(null);

  const [openTake, setOpenTake] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [openRestockReq, setOpenRestockReq] = useState(false);
  const [openQC, setOpenQC] = useState(false);

  const [openLowStockModal, setOpenLowStockModal] = useState(false);
  const [openNeedQCModal, setOpenNeedQCModal] = useState(false);

  const [suggestedRestockQty, setSuggestedRestockQty] = useState<number | null>(null);

  // ✅ dismiss toast cuma di memory (reload muncul lagi)
  const [dismissedToastIds, setDismissedToastIds] = useState<Record<string, true>>({});

  const columns: DataTableColumn<StockRow>[] = useMemo(
    () => [
      { key: "partNumber", header: "Nomor Part", accessor: "partNumber" },
      { key: "plant", header: "Cabang", accessor: "plant" },
      { key: "materialDescription", header: "Material", accessor: "materialDescription" },
      { key: "freeStock", header: "Stok Siap di Gudang", accessor: "freeStock", align: "right" },
      { key: "blockedStock", header: "Stok Cacat", accessor: "blockedStock", align: "right" },
      { key: "reorderPoint", header: "ROP", accessor: "reorderPoint", align: "right" },
    ],
    []
  );

  const openTakeFor = (r: StockRow) => {
    setSelectedRow(r);
    setOpenTake(true);
  };

  const openReturnFor = (r: StockRow) => {
    setSelectedRow(r);
    setOpenReturn(true);
  };

  const openRestockRequestFor = (r: StockRow, suggestedQty?: number) => {
    setSelectedRow(r);
    setSuggestedRestockQty(suggestedQty ?? null);
    setOpenRestockReq(true);
  };

  const openQCFor = (req: RestockNeedQCRow) => {
    setSelectedNeedQC(req);
    setOpenQC(true);
  };

  const lowStockCount = lowStock.length;
  const needQCCount = needQC.length;

  // ===== Toast items (WhatsApp-like) =====
  const toastItems: ToastItem[] = useMemo(() => {
    const items: ToastItem[] = [];

    // Low stock: tampilkan top 4 biar gak spam
    for (const r of lowStock.slice(0, 4)) {
      const id = `low:${r.partNumber}__${r.plant}`;
      if (dismissedToastIds[id]) continue;

      items.push({
        id,
        title: "Low Stock",
        desc: `${r.partNumber} • ${r.plant}`,
        pills: [`Sisa ${r.freeStock}`, `ROP ${r.reorderPoint}`],
        onClick: () => {
          const suggested = Math.max(1, (r.reorderPoint ?? 0) - (r.freeStock ?? 0));
          openRestockRequestFor(r, suggested);
        },
      });
    }

    // Need QC: tampilkan top 4
    for (const a of needQC.slice(0, 4)) {
      const id = `qc:${a.requestId}`;
      if (dismissedToastIds[id]) continue;

      items.push({
        id,
        title: "Perlu QC",
        desc: `#${a.requestId} • ${a.partNumber} • ${a.plant}`,
        pills: [`PO ${a.purchaseOrder}`, `Req ${a.requestedQty}`],
        onClick: () => openQCFor(a),
      });
    }

    return items;
  }, [needQC, lowStock, dismissedToastIds]);

  return (
    <div className={styles.page}>
      {/* ✅ WA-like toast notification */}
      <StockToastNotifications
        items={toastItems}
        onDismiss={(id) => setDismissedToastIds((prev) => ({ ...prev, [id]: true }))}
      />

      <StockActionBar
        lowStockCount={lowStockCount}
        approvedCount={needQCCount} // ✅ tetap kompatibel sama component bar lama
        loading={loading || notifLoading}
        onRefresh={() => {
          refresh();
          refreshNotifications();
        }}
        onOpenLowStock={() => setOpenLowStockModal(true)}
        onOpenApproved={() => setOpenNeedQCModal(true)} // ✅ tombol lama diarahkan ke list QC
      />

      {error ? <div className={styles.errorCard}>Error: {error}</div> : null}

      <DataTable<StockRow>
        title="Stok Barang"
        subtitle="Admin Gudang"
        rows={rows}
        columns={columns}
        rowKey={(r) => `${r.partNumber}-${r.plant}`}
        loading={loading}
        search={{ placeholder: "Cari part / cabang / material…", keys: ["partNumber", "plant", "materialDescription"] }}
        actionsHeader="Aksi"
        renderActions={(r) => (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              title="Restock (101)"
              type="button"
              onClick={() => openRestockRequestFor(r)}
              className={styles.iconBtn}
            >
              ↻
            </button>
            <button title="Return (Z48)" type="button" onClick={() => openReturnFor(r)} className={styles.iconBtn}>
              🏠
            </button>
            <button title="Ambil (261)" type="button" onClick={() => openTakeFor(r)} className={styles.iconBtn}>
              ✋
            </button>
          </div>
        )}
      />

      {/* TAKE (261) */}
      <TakeModal
        open={openTake}
        row={selectedRow}
        onClose={() => setOpenTake(false)}
        onSubmit={async (qty) => {
          if (!selectedRow) return;
          await actions.take({ partNumber: selectedRow.partNumber, plant: selectedRow.plant, quantity: qty });
          notify("Berhasil ambil barang (261).");
        }}
      />

      {/* RETURN (Z48) */}
      <ReturnModal
        open={openReturn}
        row={selectedRow}
        onClose={() => setOpenReturn(false)}
        onSubmit={async (qty) => {
          if (!selectedRow) return;
          await actions.return({ partNumber: selectedRow.partNumber, plant: selectedRow.plant, quantity: qty });
          notify("Berhasil return barang (Z48).");
        }}
      />

      {/* RESTOCK REQUEST (101) */}
      <RestockRequestModal
        open={openRestockReq}
        row={selectedRow}
        suggestedQty={suggestedRestockQty ?? undefined}
        onClose={() => {
          setOpenRestockReq(false);
          setSuggestedRestockQty(null);
        }}
        onSubmit={async (reqQty) => {
          if (!selectedRow) return;
          await actions.requestRestock({ partNumber: selectedRow.partNumber, plant: selectedRow.plant, quantity: reqQty });
          notify("Request restock dibuat. Masuk ke daftar Perlu QC setelah PO terbentuk.");
        }}
      />

      {/* QC RECEIVE (101) */}
      <RestockReceiveModal
        open={openQC}
        req={selectedNeedQC}
        onClose={() => setOpenQC(false)}
        onSubmit={async (freeIn: number, blockedIn: number) => {
          if (!selectedNeedQC) return;
          await actions.receiveRestock({ requestId: selectedNeedQC.requestId, freeIn, blockedIn });
          notify("QC berhasil. Stok ter-update.");
        }}
      />

      {/* LOW STOCK MODAL */}
      <StockModal
        open={openLowStockModal}
        title="Notifikasi Low Stock"
        subtitle="FreeStock <= ROP"
        onClose={() => setOpenLowStockModal(false)}
        footer={
          <button type="button" onClick={() => setOpenLowStockModal(false)} className={styles.btnGhost}>
            Tutup
          </button>
        }
      >
        <LowStockTable
          rows={lowStock}
          onRequest={(r) => {
            const suggested = Math.max(1, (r.reorderPoint ?? 0) - (r.freeStock ?? 0));
            openRestockRequestFor(r, suggested);
            setOpenLowStockModal(false);
          }}
        />
      </StockModal>

      {/* NEED QC MODAL */}
      <StockModal
        open={openNeedQCModal}
        title="Perlu QC"
        subtitle="Daftar restock (101) yang harus diproses QC"
        onClose={() => setOpenNeedQCModal(false)}
        footer={
          <button type="button" onClick={() => setOpenNeedQCModal(false)} className={styles.btnGhost}>
            Tutup
          </button>
        }
      >
        <NeedQCTable
          rows={needQC}
          onQC={(r) => {
            openQCFor(r);
            setOpenNeedQCModal(false);
          }}
        />
      </StockModal>
    </div>
  );
}

function LowStockTable({ rows, onRequest }: { rows: LowStockRow[]; onRequest: (r: LowStockRow) => void }) {
  return (
    <div className={styles.list}>
      {rows.length ? (
        rows.map((r) => (
          <div key={`${r.partNumber}-${r.plant}`} className={styles.listRow}>
            <div>
              <div className={styles.listTitle}>{r.partNumber}</div>
              <div className={styles.listMeta}>
                {r.plant} • {r.materialDescription}
              </div>
              <div className={styles.listMeta}>
                Sisa <b>{r.freeStock}</b> • ROP <b>{r.reorderPoint}</b>
              </div>
            </div>
            <button type="button" onClick={() => onRequest(r)} className={styles.btnPrimary}>
              Request
            </button>
          </div>
        ))
      ) : (
        <div className={styles.listMeta}>Tidak ada low stock.</div>
      )}
    </div>
  );
}

function NeedQCTable({ rows, onQC }: { rows: RestockNeedQCRow[]; onQC: (r: RestockNeedQCRow) => void }) {
  return (
    <div className={styles.list}>
      {rows.length ? (
        rows.map((r) => (
          <div key={r.requestId} className={styles.listRow}>
            <div>
              <div className={styles.listTitle}>
                #{r.requestId} • {r.partNumber}
              </div>
              <div className={styles.listMeta}>
                {r.plant} • PO <b>{r.purchaseOrder}</b> • Req <b>{r.requestedQty}</b> • {String(r.postingDate)}
              </div>
            </div>
            <button type="button" onClick={() => onQC(r)} className={styles.btnPrimary}>
              QC
            </button>
          </div>
        ))
      ) : (
        <div className={styles.listMeta}>Tidak ada item perlu QC.</div>
      )}
    </div>
  );
}
