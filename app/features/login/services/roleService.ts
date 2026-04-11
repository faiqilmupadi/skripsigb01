export type AppRole = "admin_gudang" | "kepala_gudang";

export function normalizeRole(role: unknown): string {
  return String(role ?? "").toLowerCase().trim();
}

export function assertRoleSupported(role: unknown): AppRole {
  const r = normalizeRole(role);
  if (r === "admin_gudang") return "admin_gudang";
  if (r === "kepala_gudang") return "kepala_gudang";
  throw new Error(`Role tidak dikenali: ${role}`);
}

export function roleHome(role: unknown): `/${string}` {
  const r = assertRoleSupported(role);
  return r === "admin_gudang" ? "/adminGudang/stokBarang" : "/kepalaGudang/dashboardAnalisis";
}

export function roleAllowedForPath(role: unknown, pathname: string): boolean {
  const r = assertRoleSupported(role);

  const adminArea =
    pathname.startsWith("/adminGudang") || pathname.startsWith("/api/adminGudang");
  const kepalaArea =
    pathname.startsWith("/kepalaGudang") || pathname.startsWith("/api/kepalaGudang");

  if (adminArea) return r === "admin_gudang";
  if (kepalaArea) return r === "kepala_gudang";
  return true;
}
