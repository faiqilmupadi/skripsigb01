"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/dashboardAnalisis.module.css";

import AppSidebar, { SidebarIcons } from "@/app/components/shared/AppSidebar";
import { logout } from "@/app/services/logoutService";

export default function AdminGudangLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Menggunakan ikon-ikon baru yang lebih representatif
  const sidebarItems = useMemo(
    () => [
      { 
        label: "Katalog Barang", 
        href: "/adminGudang/katalogBarang" as any, 
        icon: SidebarIcons.Katalog // <-- Ikon Grid
      },
      { 
        label: "Stok Barang", 
        href: "/adminGudang/stokBarang" as any, 
        icon: SidebarIcons.Stok // <-- Ikon Tumpukan
      },
      { 
        label: "Purchase Order", 
        href: "/adminGudang/purchaseOrder" as any, 
        icon: SidebarIcons.Cart // <-- Ikon Keranjang
      },
      { 
        label: "Sales Order", 
        href: "/adminGudang/salesOrder" as any, 
        icon: SidebarIcons.Bag // <-- Ikon Tas Belanja
      },
      { 
        label: "Daftar Vendor", 
        href: "/adminGudang/vendorList" as any, 
        icon: SidebarIcons.Truck // <-- Ikon Truk
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