// C:\faiq\skripsi\skripsigb01\app\features\katalogBarang\components\KatalogBarangTable.tsx
"use client";

import { useState } from "react";
import DataTable from "@/app/components/shared/DataTable";
import type { KatalogBarangRow } from "@/app/features/katalogBarang/types";
import TransformDetailModal from "./TransformDetailModal";
import { sharedStyles } from "@/app/components/shared/UIStyles";

interface Props {
  rows: KatalogBarangRow[];
  loading: boolean;
  onEdit: (row: KatalogBarangRow) => void;
  onDelete: (row: KatalogBarangRow) => void;
}

export default function KatalogBarangTable({ rows, loading, onEdit, onDelete }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<KatalogBarangRow | null>(null);

  const handleShowDetail = (row: KatalogBarangRow) => {
    setSelectedRow(row);
    setDetailOpen(true);
  };

  return (
    <>
      <DataTable<KatalogBarangRow>
        title="Daftar Master Barang"
        subtitle="Manajemen master barang, ROP, dan konversi satuan"
        rows={rows}
        loading={loading}
        rowKey={(r) => r.kodeBarang}
        search={{
          placeholder: "Cari kode atau nama barang...",
          keys: ["kodeBarang", "namaBarang"],
        }}
        columns={[
          { key: "kodeBarang", header: "Kode", accessor: "kodeBarang" },
          { key: "namaBarang", header: "Nama Barang", accessor: "namaBarang" },
          { key: "baseOfMeasure", header: "Satuan Dasar", accessor: "baseOfMeasure", align: "center" },
          { key: "leadtime", header: "Leadtime (Hari)", accessor: "leadtime", align: "center" },
          { key: "safetyStock", header: "Safety Stock", accessor: "safetyStock", align: "center" },
          {
            key: "transform",
            header: "Transformasi",
            render: (r: any) => {
              const count = r.allTransforms?.length || 0;
              return (
                <button
                  type="button"
                  onClick={() => count > 0 && handleShowDetail(r)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: "1.5px solid",
                    cursor: count > 0 ? "pointer" : "default",
                    fontFamily: "inherit",
                    background: count > 0 ? "#eff6ff" : "#f8fafc",
                    borderColor: count > 0 ? "#bfdbfe" : "#e2e8f0",
                    color: count > 0 ? "#2563eb" : "#94a3b8",
                    transition: "all 0.15s",
                  }}
                >
                  {count > 0 ? `🔗 ${count} Konversi` : "—"}
                </button>
              );
            },
            align: "center",
          },
        ]}
        actionsHeader="Aksi"
        renderActions={(r) => (
          <>
            <button
              title="Edit"
              onClick={() => onEdit(r)}
              type="button"
              style={{ ...sharedStyles.btnBase, ...sharedStyles.btnActionEdit }}
            >
              ✎ Edit
            </button>
            <button
              title="Hapus"
              onClick={() => onDelete(r)}
              type="button"
              style={{ ...sharedStyles.btnBase, ...sharedStyles.btnActionDelete }}
            >
              🗑 Hapus
            </button>
          </>
        )}
      />

      <TransformDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        namaBarang={selectedRow?.namaBarang || ""}
        transforms={selectedRow?.allTransforms || []}
      />
    </>
  );
}