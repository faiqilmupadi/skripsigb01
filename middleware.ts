import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyEdgeSessionAndRole } from "@/app/features/login/services/middlewareAuth";

const PUBLIC_PREFIXES = ["/login", "/api/auth/login", "/api/auth/logout", "/_next", "/favicon"];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

// UBAH BAGIAN INI: Tambahkan rute untuk ownerGudang, adminGudang, dan vendor
function isProtected(pathname: string) {
  return (
    pathname.startsWith("/ownerGudang") ||
    pathname.startsWith("/adminGudang") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/api/ownerGudang") ||
    pathname.startsWith("/api/adminGudang") ||
    pathname.startsWith("/api/vendor")
  );
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isPublic(pathname)) return NextResponse.next();
  if (!isProtected(pathname)) return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("reason", "unauthorized");
    return NextResponse.redirect(url);
  }

  const check = await verifyEdgeSessionAndRole(token, pathname);

  if (check.ok) return NextResponse.next();

  if (check.reason === "forbidden" && "redirectTo" in check) {
    const url = req.nextUrl.clone();
    url.pathname = check.redirectTo;
    url.searchParams.set("reason", "forbidden");
    return NextResponse.redirect(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("reason", check.reason);

  const res = NextResponse.redirect(url);
  res.cookies.set("session", "", { path: "/", maxAge: 0 });
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };