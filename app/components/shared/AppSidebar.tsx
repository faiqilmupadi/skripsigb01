"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/dashboardAnalisis.module.css";

type SidebarItem = {
  label: string;
  href: `/${string}`;
  icon?: React.ReactNode;
};

type Props = {
  title?: string;
  items: SidebarItem[];
  onLogoutClick: () => void;
};

// Objek ikon menggunakan format ReactNode langsung, lengkap dengan class bawaan
export const SidebarIcons = {
  // Ikon Katalog (Grid/Archive)
  Katalog: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sidebarIcon} aria-hidden="true">
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
  ),
  
  // Ikon Stok Barang (Tumpukan / Layers)
  Stok: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sidebarIcon} aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  
  // Ikon Purchase Order (Keranjang Belanja)
  Cart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sidebarIcon} aria-hidden="true">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  ),
  
  // Ikon Sales Order (Tas Belanja)
  Bag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sidebarIcon} aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  
  // Ikon Vendor (Truk Pengiriman)
  Truck: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.sidebarIcon} aria-hidden="true">
      <rect width="15" height="10" x="3" y="8" rx="2"/><path d="M18 14h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/>
    </svg>
  )
};

export default function AppSidebar({ title = "Kepala Gudang", items, onLogoutClick }: Props) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>{title}</div>
      </div>

      <nav className={styles.sidebarNav}>
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} className={active ? styles.sidebarItemActive : styles.sidebarItem}>
              {/* Memanggil ikon langsung tanpa perlu fungsi tambahan */}
              {it.icon}
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutBtn} onClick={onLogoutClick} type="button" aria-label="Logout">
          <span className={styles.logoutDot} />
        </button>
        <div className={styles.sidebarFooterHint}>Logout</div>
      </div>
    </aside>
  );
}