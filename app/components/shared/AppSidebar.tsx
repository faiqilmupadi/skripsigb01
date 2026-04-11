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

function Icon({ type }: { type: "home" | "user" | "box" | "history" }) {
  if (type === "home")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
        <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" fill="currentColor" />
      </svg>
    );
  if (type === "user")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
        <path
          d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z"
          fill="currentColor"
        />
      </svg>
    );
  if (type === "box")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
        <path d="M21 8l-9-5-9 5 9 5 9-5zm-9 7l-9-5v10l9 5V15zm2 10l9-5V10l-9 5v10z" fill="currentColor" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={styles.sidebarIcon} aria-hidden="true">
      <path d="M12 8V4l8 8-8 8v-4H4V8h8z" fill="currentColor" />
    </svg>
  );
}

export const SidebarIcons = {
  Home: <Icon type="home" />,
  User: <Icon type="user" />,
  Box: <Icon type="box" />,
  History: <Icon type="history" />,
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
