// app/adminGudang/layout.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboardAnalisis.module.css";

import AppSidebar, { SidebarIcons } from "@/app/components/shared/AppSidebar";
import { logout } from "@/app/services/logoutService";

export default function AdminGudangLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Sesuaikan dengan folder: katalogBarang, purchaseOrder, salesOrder, stokBarang, vendorList
  // Sesuaikan dengan icon yang tersedia: Home, User, Box, History
  const sidebarItems = useMemo(
    () => [
      { 
        label: "Update Status Purchase Order", 
        href: "/adminGudang/salesOrder" as any, 
        icon: SidebarIcons.Bag 
      },
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
      {/* Title diubah menjadi Admin Gudang */}
      <AppSidebar title="Admin Gudang" items={sidebarItems} onLogoutClick={() => setLogoutOpen(true)} />

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