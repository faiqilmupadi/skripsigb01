// app/features/manajemenAkun/components/ManajemenAkunClient.tsx
"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/manajemenAkun.module.css";
import { useManajemenAkun } from "@/app/features/manajemenAkun/hooks/useManajemenAkun";
import UserTable from "@/app/features/manajemenAkun/components/UserTable";
import AccountFormModal from "@/app/features/manajemenAkun/components/AccountFormModal";
import ConfirmDeleteModal from "@/app/features/manajemenAkun/components/ConfirmDeleteModal";
import type { UserRow } from "@/app/features/manajemenAkun/types";

export default function ManajemenAkunClient() {
  const { rows, loading, error, actions } = useManajemenAkun();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<UserRow | null>(null);

  const headerText = useMemo(() => {
    if (loading) return "Memuat data…";
    return `Total akun: ${rows.length}`;
  }, [loading, rows.length]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manajemen Akun</h1>
          <p className={styles.subtitle}>{headerText}</p>
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
          >
            + Tambah Akun
          </button>

          <button className={styles.btnGhost} onClick={actions.refresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <UserTable
          rows={rows}
          loading={loading}
          onEdit={(row) => {
            setEditing(row);
            setOpenForm(true);
          }}
          onDelete={(row) => {
            setDeleting(row);
            setOpenDelete(true);
          }}
        />
      </div>

      <AccountFormModal
        open={openForm}
        mode={editing ? "edit" : "create"}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onSubmit={async (payload) => {
          if (editing) await actions.update(editing.userId, payload);
          else await actions.create(payload as any);
          setOpenForm(false);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        username={deleting?.username ?? ""}
        onClose={() => setOpenDelete(false)}
        onConfirm={async () => {
          if (deleting) await actions.remove(deleting.userId);
          setOpenDelete(false);
        }}
      />
    </div>
  );
}
