import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, decodeJwt } from "jose"; // Pakai jose karena middleware jalan di Edge Runtime

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  // 1. Daftar area terproteksi
  const isOwnerArea = pathname.startsWith("/ownerGudang");
  const isAdminArea = pathname.startsWith("/adminGudang");
  const isVendorArea = pathname.startsWith("/vendor");

  // Jika mencoba akses area privat
  if (isOwnerArea || isAdminArea || isVendorArea) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Verifikasi token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      const payload = decodeJwt(token) as any;
      const role = payload.role; // Ambil role dari isi JWT

      // 2. Proteksi Cross-Role (Cek userId & Role)
      if (isOwnerArea && role !== "ownerGudang") {
        return NextResponse.redirect(new URL("/login", req.url)); // Langsung usir ke login
      }
      if (isAdminArea && role !== "adminGudang") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (isVendorArea && role !== "vendor") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      
    } catch (err) {
      // Token expired atau dimanipulasi
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ownerGudang/:path*", "/adminGudang/:path*", "/vendor/:path*"],
};