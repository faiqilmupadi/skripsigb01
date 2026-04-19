"use client";

import { useManajemenAkun } from "../hooks/useManajemenAkun";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import ManajemenFormModal from "./ManajemenFormModal";

export default function ManajemenAkunPage() {
  const { activeTab, setActiveTab, dataList, loading, formOpen, setFormOpen, formData, saving, errorMsg, handleOpenForm, handleSave, handleDelete } = useManajemenAkun();

  const userColumns: DataTableColumn<any>[] = [
    { key: "id", header: "User ID", accessor: "userId", width: 100 },
    { key: "username", header: "Username", accessor: "username", width: 130 },
    { key: "nama", header: "Nama Lengkap", accessor: "namaUser" },
    { key: "email", header: "Email", accessor: "email" },
    { 
      key: "role", header: "Role Akses", accessor: "roleUser", width: 120,
      render: (r: any) => <span style={{ background: r.roleUser === "Owner" ? "#fef08a" : r.roleUser === "Vendor" ? "#ffedd5" : "#e0f2fe", color: r.roleUser === "Owner" ? "#854d0e" : r.roleUser === "Vendor" ? "#9a3412" : "#0369a1", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{r.roleUser}</span>
    }
  ];

  const vendorColumns: DataTableColumn<any>[] = [
    { key: "id", header: "Kode Vendor", accessor: "kodeVendor", width: 130 },
    { key: "nama", header: "Nama Vendor", accessor: "namaVendor" },
    { key: "akun", header: "Akun Terkait", accessor: "userId", width: 130, render: (r: any) => r.userId ? <span style={{fontWeight: 600, color: "#475569"}}>{r.userId}</span> : "-" },
    { key: "alamat", header: "Alamat", accessor: "alamat" }
  ];

  return (
    <div style={{ padding: "32px 40px", width: "100%", boxSizing: "border-box", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0f172a" }}>Manajemen Sistem</h1>
          <p style={{ margin: "8px 0 0 0", fontSize: 15, color: "#64748b" }}>Kelola akses pengguna dan relasi data vendor gudang.</p>
        </div>
        
        <div style={{ display: "flex", background: "#e2e8f0", padding: 6, borderRadius: 12, gap: 4 }}>
          <button onClick={() => setActiveTab("admin")} style={{ padding: "8px 24px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, background: activeTab === "admin" ? "white" : "transparent", color: activeTab === "admin" ? "#0f172a" : "#64748b", boxShadow: activeTab === "admin" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>
            👥 Akun Pengguna
          </button>
          <button onClick={() => setActiveTab("vendor")} style={{ padding: "8px 24px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, background: activeTab === "vendor" ? "white" : "transparent", color: activeTab === "vendor" ? "#0f172a" : "#64748b", boxShadow: activeTab === "vendor" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>
            🏢 Database Vendor
          </button>
        </div>
      </div>

      <div style={{ background: "white", padding: 24, borderRadius: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={() => handleOpenForm()} style={{ padding: "10px 20px", background: "#0f172a", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
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
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => handleOpenForm(row)} style={{ padding: "6px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>✏️ Edit</button>
              
              {/* TOMBOL DELETE DISEMBUNYIKAN UNTUK OWNER */}
              {row.roleUser !== "Owner" && (
                <button onClick={() => handleDelete(activeTab === "admin" ? row.userId : row.kodeVendor)} style={{ padding: "6px 12px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>🗑️ Hapus</button>
              )}
            </div>
          )}
        />
      </div>

      <ManajemenFormModal 
        open={formOpen} type={activeTab} initialData={formData} saving={saving} error={errorMsg} 
        onClose={() => setFormOpen(false)} onSave={handleSave} 
      />
    </div>
  );
}