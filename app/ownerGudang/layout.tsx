// app/ownerGudang/layout.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboardAnalisis.module.css";

import AppSidebar, { SidebarIcons } from "@/app/components/shared/AppSidebar";
import { logout } from "@/app/services/logoutService";

export default function ownerGudangLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const sidebarItems = useMemo(
    () => [
      { label: "Dashboard Analisis", href: "/ownerGudang/dashboardAnalisis" as const, icon: SidebarIcons.Home },
      { label: "Manajemen Akun", href: "/ownerGudang/manajemenAkun" as const, icon: SidebarIcons.User },
      { label: "HistoryOrder", href: "/ownerGudang/historyOrder" as const, icon: SidebarIcons.History },
    ],
    []
  );

  const onLogout = async () => {
    await logout();
    setLogoutOpen(false);
    router.replace("/login");
  };

  return (
    <div className={styles.shell}>
      <AppSidebar title="Kepala Gudang" items={sidebarItems} onLogoutClick={() => setLogoutOpen(true)} />

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
