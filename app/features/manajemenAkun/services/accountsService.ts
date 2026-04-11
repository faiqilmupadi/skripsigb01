// app/features/manajemenAkun/services/accountsService.ts
import bcrypt from "bcryptjs";
import { dbQuery } from "@/app/lib/db.server";
import type { CreateUserInput, UpdateUserInput, UserRow, UserRole } from "@/app/features/manajemenAkun/types";

type UserDbRow = {
  userId: string;
  username: string;
  email: string;
  role: string;
  createdOn: Date | string;
  lastChange: Date | string | null;
  deletedOn?: Date | string | null;
};

const toISO = (v: Date | string | null | undefined) => (v ? new Date(v).toISOString() : null);

function toUserRow(r: UserDbRow): UserRow {
  return {
    userId: String(r.userId),
    username: r.username,
    email: r.email,
    role: r.role as UserRole,
    createdOn: new Date(r.createdOn).toISOString(),
    lastChange: toISO(r.lastChange),
  };
}

function normalizeUserId(userId: string) {
  const v = String(userId ?? "").trim();
  if (!v) throw new Error("userId tidak valid");
  // opsional: batasi karakter
  // if (!/^[A-Za-z0-9_]+$/.test(v)) throw new Error("userId tidak valid");
  return v;
}

function assertRole(role: unknown): asserts role is UserRole {
  if (role !== "admin_gudang" && role !== "kepala_gudang") {
    throw new Error("Role tidak valid");
  }
}

export const accountsService = {
  async list(): Promise<UserRow[]> {
    const rows = await dbQuery<UserDbRow>(
      `SELECT userId, username, email, role, createdOn, lastChange
       FROM users
       WHERE deletedOn IS NULL
       ORDER BY createdOn DESC`
    );
    return rows.map(toUserRow);
  },

  async getById(userId: string): Promise<UserRow | null> {
    const id = normalizeUserId(userId);
    const rows = await dbQuery<UserDbRow>(
      `SELECT userId, username, email, role, createdOn, lastChange
       FROM users
       WHERE userId = ? AND deletedOn IS NULL
       LIMIT 1`,
      [id]
    );
    return rows[0] ? toUserRow(rows[0]) : null;
  },

  async create(input: CreateUserInput): Promise<UserRow> {
    const userId = normalizeUserId(input.userId);
    assertRole(input.role);

    if (!input.username?.trim()) throw new Error("Username wajib diisi");
    if (!input.email?.trim()) throw new Error("Email wajib diisi");
    if (!input.password) throw new Error("Password wajib diisi");

    const dupId = await dbQuery<{ userId: string }>(
      `SELECT userId FROM users WHERE userId = ? LIMIT 1`,
      [userId]
    );
    if (dupId.length) throw new Error("userId sudah dipakai");

    const dup = await dbQuery<{ userId: string }>(
      `SELECT userId FROM users
       WHERE (username = ? OR email = ?) AND deletedOn IS NULL
       LIMIT 1`,
      [input.username, input.email]
    );
    if (dup.length) throw new Error("Username atau email sudah dipakai");

    const hash = await bcrypt.hash(input.password, 10);

    await dbQuery(
      `INSERT INTO users (userId, username, email, password, role, createdOn, lastChange, deletedOn)
       VALUES (?, ?, ?, ?, ?, NOW(), NULL, NULL)`,
      [userId, input.username.trim(), input.email.trim(), hash, input.role]
    );

    const created = await this.getById(userId);
    if (!created) throw new Error("Gagal membuat user");
    return created;
  },

  async update(userId: string, input: UpdateUserInput): Promise<UserRow | null> {
    const id = normalizeUserId(userId);

    const existing = await this.getById(id);
    if (!existing) return null;

    if (input.role) assertRole(input.role);

    const nextUsername = (input.username ?? existing.username).trim();
    const nextEmail = (input.email ?? existing.email).trim();

    if (nextUsername !== existing.username || nextEmail !== existing.email) {
      const dup = await dbQuery<{ userId: string }>(
        `SELECT userId FROM users
         WHERE (username = ? OR email = ?)
           AND userId <> ?
           AND deletedOn IS NULL
         LIMIT 1`,
        [nextUsername, nextEmail, id]
      );
      if (dup.length) throw new Error("Username atau email sudah dipakai user lain");
    }

    const sets: string[] = [];
    const params: any[] = [];

    if (input.username !== undefined) {
      if (!nextUsername) throw new Error("Username wajib diisi");
      sets.push("username = ?");
      params.push(nextUsername);
    }

    if (input.email !== undefined) {
      if (!nextEmail) throw new Error("Email wajib diisi");
      sets.push("email = ?");
      params.push(nextEmail);
    }

    if (input.role !== undefined) {
      sets.push("role = ?");
      params.push(input.role);
    }

    if (input.password) {
      const hash = await bcrypt.hash(input.password, 10);
      sets.push("password = ?");
      params.push(hash);
    }

    // update lastChange
    sets.push("lastChange = NOW()");

    if (!sets.length) return await this.getById(id);

    params.push(id);

    await dbQuery(
      `UPDATE users SET ${sets.join(", ")}
       WHERE userId = ? AND deletedOn IS NULL`,
      params
    );

    return await this.getById(id);
  },

  // ✅ SOFT DELETE
  async remove(userId: string): Promise<boolean> {
    const id = normalizeUserId(userId);

    const exists = await dbQuery<{ userId: string }>(
      `SELECT userId FROM users WHERE userId = ? AND deletedOn IS NULL LIMIT 1`,
      [id]
    );
    if (!exists.length) return false;

    await dbQuery(
      `UPDATE users
       SET deletedOn = NOW(), lastChange = NOW()
       WHERE userId = ? AND deletedOn IS NULL`,
      [id]
    );

    return true;
  },
};
