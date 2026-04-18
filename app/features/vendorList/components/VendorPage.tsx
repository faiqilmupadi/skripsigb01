"use client";

import { useState } from "react";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import { ActiveTab, Vendor, VendorList } from "../types";
import { useVendor } from "../hooks/useVendor";
import { useVendorList } from "../hooks/useVendorList";
import VendorForm from "./VendorForm";
import VendorListForm from "./VendorListForm";
import DeleteConfirmModal from "./DeleteConfirmModal";
import styles from "@/styles/manajemenAkun.module.css";

const vendorColumns: DataTableColumn<Vendor>[] = [
  { key: "kodeVendor", header: "Kode Vendor", width: 130, accessor: "kodeVendor" },
  { key: "namaVendor", header: "Nama Vendor", accessor: "namaVendor" },
  { key: "alamat", header: "Alamat", accessor: "alamat" },
];

const vendorListColumns: DataTableColumn<VendorList>[] = [
  { key: "kodeVendor", header: "Kode Vendor", width: 110, accessor: "kodeVendor" },
  { key: "namaVendor", header: "Nama Vendor", accessor: "namaVendor" },
  { key: "kodeBarang", header: "Kode Barang", width: 110, accessor: "kodeBarang" },
  { key: "namaBarang", header: "Nama Barang", accessor: "namaBarang" },
  { key: "warnaBarang", header: "Warna", width: 90, accessor: "warnaBarang" },
  { 
    key: "hargaDariVendor", 
    header: "Harga", 
    width: 120, 
    accessor: "hargaDariVendor", 
    render: (rowOrVal: any) => {
      // Pengecekan aman: jika yang dilempar adalah objek baris (row), ambil hargaDariVendor
      const harga = typeof rowOrVal === "object" && rowOrVal !== null 
        ? rowOrVal.hargaDariVendor 
        : rowOrVal;
        
      const num = Number(harga);
      return isNaN(num) || !harga ? "Rp 0" : `Rp ${num.toLocaleString("id-ID")}`;
    } 
  },
  { key: "eum", header: "EuM", width: 80, align: "center", accessor: "eum" },
];
const TABS: { key: ActiveTab; label: string }[] = [
  { key: "vendor", label: "Vendor" },
  { key: "vendorList", label: "Vendor List" },
];

export default function VendorPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("vendor");
  const vendor = useVendor();
  const vendorList = useVendorList();

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Manajemen Vendor</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>
            Kelola data vendor dan daftar barang per vendor
          </p>
        </div>

        <div style={{ display: "flex", background: "var(--color-background-secondary)", borderRadius: 8, padding: 4, gap: 4 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "6px 20px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 500 : 400,
                background: activeTab === tab.key ? "var(--color-background-primary)" : "transparent",
                color: activeTab === tab.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                boxShadow: activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          className={styles.btnPrimary}
          type="button"
          onClick={activeTab === "vendor" ? vendor.openAdd : vendorList.openAdd}
        >
          + Tambah {activeTab === "vendor" ? "Vendor" : "Vendor List"}
        </button>
      </div>

      {activeTab === "vendor" && (
        <>
          <DataTable<Vendor>
            title="Data Vendor"
            rows={vendor.rows}
            columns={vendorColumns}
            rowKey={(r) => r.kodeVendor}
            loading={vendor.loading}
            search={{ placeholder: "Cari kode / nama vendor…", keys: ["kodeVendor", "namaVendor", "alamat"] }}
            actionsHeader="Aksi"
            renderActions={(row) => (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className={styles.btnGhost} type="button" style={{ padding: "4px 12px", fontSize: 13 }} onClick={() => vendor.openEdit(row)}>Edit</button>
                <button className={styles.btnPrimary} type="button" style={{ padding: "4px 12px", fontSize: 13, background: "var(--color-background-danger)", color: "var(--color-text-danger)" }} onClick={() => vendor.openDelete(row)}>Hapus</button>
              </div>
            )}
          />

          <VendorForm
            open={vendor.formOpen}
            editTarget={vendor.editTarget}
            form={vendor.form}
            saving={vendor.saving}
            error={vendor.error}
            onClose={vendor.closeForm}
            onSubmit={vendor.handleSave}
            onChange={(patch) => vendor.setForm((prev) => ({ ...prev, ...patch }))}
          />

          <DeleteConfirmModal
            open={!!vendor.deleteTarget}
            label={`${vendor.deleteTarget?.kodeVendor} — ${vendor.deleteTarget?.namaVendor}`}
            deleting={vendor.deleting}
            onConfirm={vendor.handleDelete}
            onCancel={vendor.closeDelete}
          />
        </>
      )}

      {activeTab === "vendorList" && (
        <>
          <DataTable<VendorList>
            title="Data Vendor List"
            rows={vendorList.rows}
            columns={vendorListColumns}
            rowKey={(r) => `${r.kodeVendor}-${r.kodeBarang}`}
            loading={vendorList.loading}
            search={{ placeholder: "Cari data…", keys: ["kodeVendor", "namaVendor", "kodeBarang", "namaBarang", "warnaBarang"] }}
            actionsHeader="Aksi"
            renderActions={(row) => (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className={styles.btnGhost} type="button" style={{ padding: "4px 12px", fontSize: 13 }} onClick={() => vendorList.openEdit(row)}>Edit</button>
                <button className={styles.btnPrimary} type="button" style={{ padding: "4px 12px", fontSize: 13, background: "var(--color-background-danger)", color: "var(--color-text-danger)" }} onClick={() => vendorList.openDelete(row)}>Hapus</button>
              </div>
            )}
          />

          <VendorListForm
            open={vendorList.formOpen}
            editTarget={vendorList.editTarget}
            form={vendorList.form}
            vendors={vendorList.vendors}
            barangOptions={vendorList.barangOptions}
            saving={vendorList.saving}
            error={vendorList.error}
            onClose={vendorList.closeForm}
            onSubmit={vendorList.handleSave}
            onChange={(patch) => vendorList.setForm((prev) => ({ ...prev, ...patch }))}
            onKodeVendorChange={vendorList.handleKodeVendorChange}
            onKodeBarangChange={vendorList.handleKodeBarangChange}
          />

          <DeleteConfirmModal
            open={!!vendorList.deleteTarget}
            label={`${vendorList.deleteTarget?.kodeVendor} — ${vendorList.deleteTarget?.kodeBarang}`}
            deleting={vendorList.deleting}
            onConfirm={vendorList.handleDelete}
            onCancel={vendorList.closeDelete}
          />
        </>
      )}
    </div>
  );
}