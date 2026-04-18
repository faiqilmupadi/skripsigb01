import { POVendorGroup, VendorInfo } from "../types";

const BASE_URL = "/api/vendor/updateStatusBarang";

// Parameter userId dihapus karena API akan membacanya dari Cookies sesi
export async function fetchVendorData(): Promise<{ vendorInfo: VendorInfo, data: POVendorGroup[] }> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    // Pastikan kredensial (cookies) selalu dikirim
    credentials: "include" 
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal mengambil data pesanan vendor.");
  }
  
  return res.json();
}

export async function updateStatusPO(nomorPO: string, kodeVendor: string, status: string): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ nomorPO, kodeVendor, status }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Gagal memperbarui status pesanan.");
  }
}