"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboardAnalisis.module.css";

import AppSidebar, { SidebarIcons } from "@/app/components/shared/AppSidebar";
import { logout } from "@/app/services/logoutService";

// Pastikan huruf depan komponen adalah huruf Kapital (OwnerGudangLayout)
export default function OwnerGudangLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Ini adalah daftar menu yang akan ditampilkan di sidebar
  const sidebarItems = useMemo(
    () => [
      { 
        label: "Dashboard Analisis", 
        href: "/ownerGudang/dashboardAnalisis" as any, 
        icon: SidebarIcons.Home 
      },
      { 
        label: "Manajemen Akun", 
        href: "/ownerGudang/manajemenAkun" as any, 
        icon: SidebarIcons.User 
      },
      { 
        label: "Riwayat Transaksi", 
        href: "/ownerGudang/riwayatTransaksi" as any, 
        icon: SidebarIcons.History 
      },
    ],
    []
  );

  const onLogout = async () => {
    await logout();
    setLogoutOpen(false);
    sessionStorage.clear(); // Membersihkan sisa memori notifikasi ROP jika ada
    router.replace("/login");
  };

  return (
    <div className={styles.shell}>
      <AppSidebar title="Owner Gudang" items={sidebarItems} onLogoutClick={() => setLogoutOpen(true)} />

      <main className={styles.main}>{children}</main>

      {logoutOpen ? (
        <div className={styles.modalOverlay} onClick={() => setLogoutOpen(false)} role="presentation">
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} role="presentation">
            <div className={styles.modalTitle}>Akhiri sesi?</div>
            <div className={styles.modalMessage}>Kamu akan logout dan session akan dihapus.</div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnGhost} onClick={() => setLogoutOpen(false)} type="button">
                Batal
              </button>
              <button className={styles.modalBtnDanger} onClick={onLogout} type="button">
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}