"use client";

import DataTable from "@/app/components/shared/DataTable";
import type { KatalogBarangRow } from "@/app/features/katalogBarang/types";

type Props = {
  rows: KatalogBarangRow[];
  loading: boolean;
  onEdit: (row: KatalogBarangRow) => void;
  onDelete: (row: KatalogBarangRow) => void;
};

export default function KatalogBarangTable({ rows, loading, onEdit, onDelete }: Props) {
  return (
    <DataTable<KatalogBarangRow>
      title="Product Summary"
      subtitle="Katalog barang per cabang"
      rows={rows}
      loading={loading}
      rowKey={(r) => `${r.partNumber}__${r.plant}`}
      search={{
        placeholder: "Search nomer part, cabang, material…",
        keys: ["partNumber", "plant", "materialDescription", "baseUnitOfMeasure"],
      }}
      columns={[
        { key: "partNumber", header: "Nomer Part", accessor: "partNumber" },
        { key: "plant", header: "Cabang", accessor: "plant" },
        { key: "freeStock", header: "Jumlah", accessor: "freeStock", align: "right" },
        { key: "materialDescription", header: "Material", accessor: "materialDescription" },
        { key: "baseUnitOfMeasure", header: "Satuan", accessor: "baseUnitOfMeasure" },
        { key: "reorderPoint", header: "ROP", accessor: "reorderPoint", align: "right" },
        { key: "safetyStock", header: "Safety Stock", accessor: "safetyStock", align: "right" },
        { key: "materialGroup", header: "Material Grup", render: (r) => r.materialGroup ?? "-" },
        { key: "createdBy", header: "Dibuat Oleh", render: (r) => r.createdBy ?? "-" },
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
