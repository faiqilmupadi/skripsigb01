export type AppRole = "ownerGudang" | "adminGudang" | "vendor";

export function normalizeRole(role: unknown): string {
  return String(role ?? "").toLowerCase().trim();
}

export function assertRoleSupported(role: unknown): AppRole {
  const r = normalizeRole(role);
  
  // Mencocokkan data dari database (misal: "Owner", "Admin_Gudang", "Vendor") ke AppRole
  if (r === "owner" || r === "ownergudang") return "ownerGudang";
  if (r === "admin_gudang" || r === "admingudang") return "adminGudang";
  if (r === "vendor") return "vendor";
  
  throw new Error(`Role tidak dikenali: ${role}`);
}

export function roleHome(role: unknown): `/${string}` {
  const r = assertRoleSupported(role);
  
  // Tentukan halaman pertama saat user berhasil login
  if (r === "ownerGudang") return "/ownerGudang/dashboardAnalisis";
  if (r === "adminGudang") return "/adminGudang/katalogBarang";
  if (r === "vendor") return "/vendor/updateStatusBarang";
  
  return "/";
}

export function roleAllowedForPath(role: unknown, pathname: string): boolean {
  const r = assertRoleSupported(role);

  const ownerArea = pathname.startsWith("/ownerGudang") || pathname.startsWith("/api/ownerGudang");
  const adminArea = pathname.startsWith("/adminGudang") || pathname.startsWith("/api/adminGudang");
  const vendorArea = pathname.startsWith("/vendor") || pathname.startsWith("/api/vendor");

  // Pengecekan izin akses
  if (ownerArea) return r === "ownerGudang";
  if (adminArea) return r === "adminGudang";
  if (vendorArea) return r === "vendor";
  
  return true; // Izinkan jika itu rute umum/publik
}