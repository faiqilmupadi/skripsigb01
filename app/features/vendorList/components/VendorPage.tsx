// C:\faiq\skripsi\skripsigb01\app\features\vendorList\components\VendorPage.tsx
"use client";

import { useState } from "react";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import { ActiveTab, Vendor, VendorList } from "../types";
import { useVendor } from "../hooks/useVendor";
import { useVendorList } from "../hooks/useVendorList";
import VendorForm from "./VendorForm";
import VendorListForm from "./VendorListForm";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { sharedStyles } from "@/app/components/shared/UIStyles";

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
    key: "hargaDariVendor", header: "Harga", width: 130, accessor: "hargaDariVendor",
    render: (rowOrVal: any) => {
      const harga = typeof rowOrVal === "object" && rowOrVal !== null ? rowOrVal.hargaDariVendor : rowOrVal;
      const num = Number(harga);
      return (
        <span style={{ fontWeight: 700, color: "#0f172a" }}>
          {isNaN(num) || !harga ? "Rp 0" : `Rp ${num.toLocaleString("id-ID")}`}
        </span>
      );
    },
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
    <div style={sharedStyles.pageWrapper}>
      <div style={sharedStyles.headerContainer}>
        <div>
          <h1 style={sharedStyles.pageTitle}>Manajemen Vendor</h1>
          <p style={sharedStyles.pageSubtitle}>
            Kelola data vendor dan daftar barang per vendor
          </p>
        </div>

        {/* Tab switcher */}
        <div style={sharedStyles.tabContainer}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={sharedStyles.tabButton(activeTab === tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button
          style={{ ...sharedStyles.btnBase, ...sharedStyles.btnPrimary }}
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
              <>
                <button
                  type="button"
                  style={{ ...sharedStyles.btnBase, ...sharedStyles.btnActionEdit }}
                  onClick={() => vendor.openEdit(row)}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  style={{ ...sharedStyles.btnBase, ...sharedStyles.btnActionDelete }}
                  onClick={() => vendor.openDelete(row)}
                >
                  🗑️ Hapus
                </button>
              </>
            )}
          />
          <VendorForm
            open={vendor.formOpen} editTarget={vendor.editTarget} form={vendor.form}
            saving={vendor.saving} error={vendor.error}
            onClose={vendor.closeForm} onSubmit={vendor.handleSave}
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
              <>
                <button
                  type="button"
                  style={{ ...sharedStyles.btnBase, ...sharedStyles.btnActionEdit }}
                  onClick={() => vendorList.openEdit(row)}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  style={{ ...sharedStyles.btnBase, ...sharedStyles.btnActionDelete }}
                  onClick={() => vendorList.openDelete(row)}
                >
                  🗑️ Hapus
                </button>
              </>
            )}
          />
          <VendorListForm
            open={vendorList.formOpen} editTarget={vendorList.editTarget} form={vendorList.form}
            vendors={vendorList.vendors} barangOptions={vendorList.barangOptions}
            saving={vendorList.saving} error={vendorList.error}
            onClose={vendorList.closeForm} onSubmit={vendorList.handleSave}
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