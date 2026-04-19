"use client";

import { useState } from "react";
import DataTable from "@/app/components/shared/DataTable";
import type { KatalogBarangRow } from "@/app/features/katalogBarang/types";
import TransformDetailModal from "./TransformDetailModal";

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
          { 
            key: "baseOfMeasure", 
            header: "Satuan Dasar", 
            accessor: "baseOfMeasure", 
            align: "center" 
          },
          { 
            key: "leadtime", 
            header: "Leadtime (Hari)", 
            accessor: "leadtime", 
            align: "center" 
          },
          { 
            key: "safetyStock", 
            header: "Safety Stock", 
            accessor: "safetyStock", 
            align: "center" 
          },
          { 
            key: "transform", 
            header: "Transformasi", 
            render: (r: any) => {
              const count = r.allTransforms?.length || 0;
              return (
                <button 
                  type="button"
                  onClick={() => handleShowDetail(r)}
                  style={{ 
                    color: count > 0 ? '#007bff' : '#999', 
                    textDecoration: count > 0 ? 'underline' : 'none', 
                    border: 'none', 
                    background: 'none', 
                    // PERBAIKAN DI SINI: Ditambahkan : 'default'
                    cursor: count > 0 ? 'pointer' : 'default', 
                    fontWeight: '500' 
                  }}
                >
                  {count > 0 ? `Lihat Detail (${count})` : "-"}
                </button>
              );
            }, 
            align: "center" 
          },
        ]}
        actionsHeader="Aksi"
        renderActions={(r) => (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              title="Edit" 
              onClick={() => onEdit(r)} 
              type="button" 
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
            >
              ✎
            </button>
            <button 
              title="Hapus" 
              onClick={() => onDelete(r)} 
              type="button" 
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red', fontSize: '16px' }}
            >
              🗑
            </button>
          </div>
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