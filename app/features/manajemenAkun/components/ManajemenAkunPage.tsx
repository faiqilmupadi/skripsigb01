"use client";

import { useManajemenAkun } from "../hooks/useManajemenAkun";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import ManajemenFormModal from "./ManajemenFormModal";

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 12px",
  fontSize: 12.5,
  fontWeight: 600,
  borderRadius: 8,
  border: "1.5px solid",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
};

export default function ManajemenAkunPage() {
  const {
    activeTab, setActiveTab, dataList, loading,
    formOpen, setFormOpen, formData, saving, errorMsg,
    handleOpenForm, handleSave, handleDelete,
  } = useManajemenAkun();

  const userColumns: DataTableColumn<any>[] = [
    { key: "id", header: "User ID", accessor: "userId", width: 100 },
    { key: "username", header: "Username", accessor: "username", width: 130 },
    { key: "nama", header: "Nama Lengkap", accessor: "namaUser" },
    { key: "email", header: "Email", accessor: "email" },
    {
      key: "role", header: "Role Akses", accessor: "roleUser", width: 120,
      render: (r: any) => {
        const role = r.roleUser;
        const styles: Record<string, { bg: string; color: string }> = {
          Owner: { bg: "#fef9c3", color: "#854d0e" },
          Vendor: { bg: "#ffedd5", color: "#9a3412" },
        };
        const s = styles[role] ?? { bg: "#e0f2fe", color: "#0369a1" };
        return (
          <span style={{
            background: s.bg, color: s.color,
            padding: "3px 10px", borderRadius: 20,
            fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3,
          }}>
            {role}
          </span>
        );
      },
    },
  ];

  const vendorColumns: DataTableColumn<any>[] = [
    { key: "id", header: "Kode Vendor", accessor: "kodeVendor", width: 130 },
    { key: "nama", header: "Nama Vendor", accessor: "namaVendor" },
    {
      key: "akun", header: "Akun Terkait", accessor: "userId", width: 130,
      render: (r: any) => r.userId
        ? <span style={{ fontWeight: 600, color: "#475569", fontFamily: "monospace", fontSize: 13 }}>{r.userId}</span>
        : <span style={{ color: "#cbd5e1" }}>—</span>,
    },
    { key: "alamat", header: "Alamat", accessor: "alamat" },
  ];

  return (
    <div style={{ padding: "32px 40px", width: "100%", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5 }}>Manajemen Sistem</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>Kelola akses pengguna dan relasi data vendor gudang.</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: "#f1f5f9", padding: 5, borderRadius: 12, gap: 4 }}>
          {[
            { key: "admin", label: "👥 Akun Pengguna" },
            { key: "vendor", label: "🏢 Database Vendor" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "8px 22px",
                border: "none",
                borderRadius: 9,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13.5,
                fontFamily: "inherit",
                background: activeTab === tab.key ? "#fff" : "transparent",
                color: activeTab === tab.key ? "#0f172a" : "#64748b",
                boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <button
            onClick={() => handleOpenForm()}
            style={{
              ...btnBase,
              padding: "9px 20px",
              background: "#0f172a",
              borderColor: "#0f172a",
              color: "#fff",
              fontSize: 13.5,
              borderRadius: 10,
            }}
          >
            + Tambah {activeTab === "admin" ? "Akun" : "Vendor"}
          </button>
        </div>

        <DataTable
          title={`Daftar ${activeTab === "admin" ? "Pengguna Sistem" : "Vendor Terdaftar"}`}
          rows={dataList}
          columns={activeTab === "admin" ? userColumns : vendorColumns}
          rowKey={(r) => activeTab === "admin" ? r.userId : r.kodeVendor}
          loading={loading}
          search={{ placeholder: "Ketik untuk mencari...", keys: activeTab === "admin" ? ["userId", "username", "namaUser"] : ["kodeVendor", "namaVendor"] }}
          actionsHeader="Aksi"
          renderActions={(row) => (
            <>
              <button
                onClick={() => handleOpenForm(row)}
                style={{ ...btnBase, background: "#f0f9ff", borderColor: "#bae6fd", color: "#0284c7" }}
              >
                ✏️ Edit
              </button>
              {row.roleUser !== "Owner" && (
                <button
                  onClick={() => handleDelete(activeTab === "admin" ? row.userId : row.kodeVendor)}
                  style={{ ...btnBase, background: "#fef2f2", borderColor: "#fecaca", color: "#dc2626" }}
                >
                  🗑️ Hapus
                </button>
              )}
            </>
          )}
        />
      </div>

      <ManajemenFormModal
        open={formOpen}
        type={activeTab}
        initialData={formData}
        saving={saving}
        error={errorMsg}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}