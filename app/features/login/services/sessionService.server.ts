import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type SessionUser = {
  sub: string | number;
  username: string;
  role: string;
  email?: string;
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET belum di-set di .env.local");
  return secret;
}

export function signSessionToken(payload: SessionUser): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "2h" });
}

export function verifySessionToken(token: string): SessionUser {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded === "string") throw new Error("INVALID_TOKEN");
  return decoded as SessionUser;
}

export function sessionCookieConfig() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get("session")?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser> {
  const token = await getSessionTokenFromCookies();
  if (!token) throw new Error("NO_SESSION");
  return verifySessionToken(token);
}
