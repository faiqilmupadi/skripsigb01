import { jwtVerify, decodeJwt } from "jose";
import { normalizeRole, roleAllowedForPath, roleHome } from "./roleService";

export type EdgeVerifyResult =
  | { ok: true }
  | { ok: false; reason: "server_misconfig" | "invalid_role" | "expired" }
  | { ok: false; reason: "forbidden"; redirectTo: `/${string}` };

export async function verifyEdgeSessionAndRole(
  token: string,
  pathname: string
): Promise<EdgeVerifyResult> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return { ok: false, reason: "server_misconfig" };

  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);

    const payload = decodeJwt(token) as any;
    const role = normalizeRole(payload?.role);

    if (!role) return { ok: false, reason: "invalid_role" };

    if (!roleAllowedForPath(role, pathname)) {
      return { ok: false, reason: "forbidden", redirectTo: roleHome(role) };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "expired" };
  }
}
