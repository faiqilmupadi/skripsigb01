import bcrypt from "bcryptjs";
import { dbQuery } from "@/app/lib/db.server";
import { signSessionToken, type SessionUser } from "./sessionService.server";
import { roleHome, assertRoleSupported } from "./roleService";

export type LoginRequestBody = { identifier: string; password: string };

type UserRow = {
  userId: string | number;
  username: string;
  email: string;
  password: string;
  role: string;
  deletedOn?: string | null;
};

function looksLikeBcryptHash(v: string) {
  return typeof v === "string" && /^\$2[aby]\$\d{2}\$/.test(v);
}

async function verifyPassword(inputPassword: string, storedPassword: string) {
  if (!looksLikeBcryptHash(storedPassword)) return inputPassword === storedPassword;
  return bcrypt.compare(inputPassword, storedPassword);
}

export type LoginResult =
  | {
      ok: true;
      redirectTo: `/${string}`;
      user: { userId: string | number; username: string; role: string };
      token: string;
    }
  | { ok: false; status: number; message: string };

export async function loginWithPassword(payload: Partial<LoginRequestBody>): Promise<LoginResult> {
  const identifier = (payload.identifier ?? "").trim();
  const password = payload.password ?? "";

  if (!identifier || !password) {
    return { ok: false, status: 400, message: "Username/Email dan password wajib diisi." };
  }

  // UBAH BAGIAN INI: Menggunakan "roleUser AS role"
  const rows = await dbQuery<UserRow>(
    `SELECT userId, username, email, password, roleUser AS role, deletedOn
     FROM users
     WHERE (username = ? OR email = ?)
       AND (deletedOn IS NULL)
     LIMIT 1`,
    [identifier, identifier]
  );

  const user = rows[0];
  if (!user) return { ok: false, status: 401, message: "User tidak ditemukan." };

  const passOk = await verifyPassword(password, user.password);
  if (!passOk) return { ok: false, status: 401, message: "Password salah." };

  let role: string;
  try {
    role = assertRoleSupported(user.role);
  } catch {
    return { ok: false, status: 403, message: "Role user tidak valid / belum didukung." };
  }

  const redirectTo = roleHome(role);

  const sessionPayload: SessionUser = {
    sub: user.userId,
    username: user.username,
    role,
    email: user.email,
  };

  const token = signSessionToken(sessionPayload);

  return {
    ok: true,
    redirectTo,
    user: { userId: user.userId, username: user.username, role },
    token,
  };
}