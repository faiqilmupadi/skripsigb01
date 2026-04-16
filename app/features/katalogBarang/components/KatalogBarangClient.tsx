// C:\faiq\skripsi\skripsigb01\app\features\katalogBarang\components\KatalogBarangClient.tsx
"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/manajemenAkun.module.css";
import { useKatalogBarang } from "@/app/features/katalogBarang/hooks/useKatalogBarang";
import type { KatalogBarangRow } from "@/app/features/katalogBarang/types";
import KatalogBarangTable from "@/app/features/katalogBarang/components/KatalogBarangTable";
import BarangFormModal from "@/app/features/katalogBarang/components/BarangFormModal";
import ConfirmDeleteBarangModal from "@/app/features/katalogBarang/components/ConfirmDeleteBarangModal";

// 🔥 PERBAIKAN DI SINI: Ubah id: number menjadi kodeWarna: string
type Props = {
  colorOptions: { kodeWarna: string; namaWarna: string }[];
};

export default function KatalogBarangClient({ colorOptions }: Props) {
  const { rows, loading, error, actions } = useKatalogBarang();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<KatalogBarangRow | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<KatalogBarangRow | null>(null);

  const headerText = useMemo(() => {
    if (loading) return "Memuat data…";
    return `Total master barang terdaftar: ${rows.length}`;
  }, [loading, rows.length]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Katalog Barang (Master)</h1>
          <p className={styles.subtitle}>{headerText}</p>
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => { setEditing(null); setOpenForm(true); }} type="button">
            + Pendaftaran Barang
          </button>
          <button className={styles.btnGhost} onClick={actions.refresh} disabled={loading} type="button">
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <KatalogBarangTable
          rows={rows}
          loading={loading}
          onEdit={(row) => { setEditing(row); setOpenForm(true); }}
          onDelete={(row) => { setDeleting(row); setOpenDelete(true); }}
        />
      </div>

      <BarangFormModal
        open={openForm}
        mode={editing ? "edit" : "create"}
        initial={editing}
        colorOptions={colorOptions} // Data sudah sesuai sekarang
        onClose={() => setOpenForm(false)}
        onSubmit={async (payload) => {
          if (editing) {
            await actions.update(editing.kodeBarang, payload as any); 
          } else {
            await actions.create(payload as any);
          }
          setOpenForm(false);
        }}
      />

      <ConfirmDeleteBarangModal
        open={openDelete}
        label={deleting ? deleting.namaBarang : ""}
        onClose={() => setOpenDelete(false)}
        onConfirm={async () => {
          if (deleting) await actions.remove(deleting.kodeBarang);
          setOpenDelete(false);
        }}
      />
    </div>
  );
}