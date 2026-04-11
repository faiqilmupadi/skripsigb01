"use client";

import DataTable from "@/app/components/shared/DataTable";
import type { UserRow } from "@/app/features/manajemenAkun/types";

type Props = {
  rows: UserRow[];
  loading: boolean;
  onEdit: (row: UserRow) => void;
  onDelete: (row: UserRow) => void;
};

export default function UserTable({ rows, loading, onEdit, onDelete }: Props) {
  return (
    <DataTable<UserRow>
      title="Product Summary"
      subtitle="Daftar akun pengguna"
      rows={rows}
      loading={loading}
      rowKey={(r) => r.userId}
      search={{ placeholder: "Search userId, nama, email, role…", keys: ["userId", "username", "email", "role"] }}
      columns={[
        { key: "username", header: "Nama", accessor: "username" },
        { key: "email", header: "Email", accessor: "email" },
        { key: "role", header: "Role", accessor: "role" },
        {
          key: "createdOn",
          header: "Created On",
          render: (r) => new Date(r.createdOn).toLocaleString(),
        },
      ]}
      actionsHeader="Aksi"
      renderActions={(r) => (
        <>
          <button title="Edit" onClick={() => onEdit(r)} type="button">
            ✎
          </button>
          <button title="Hapus" onClick={() => onDelete(r)} type="button">
            🗑
          </button>
        </>
      )}
    />
  );
}
