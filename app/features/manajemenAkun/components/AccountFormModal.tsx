// app/features/manajemenAkun/components/AccountFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/manajemenAkun.module.css";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRow,
  UserRole,
} from "@/app/features/manajemenAkun/types";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial: UserRow | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserInput | UpdateUserInput) => Promise<void>;
};

export default function AccountFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("kepala_gudang");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);

    if (mode === "edit" && initial) {
      setUserId(initial.userId);
      setUsername(initial.username);
      setEmail(initial.email);
      setRole(initial.role);
      setPassword("");
    } else {
      setUserId("");
      setUsername("");
      setEmail("");
      setRole("kepala_gudang");
      setPassword("");
    }
  }, [open, mode, initial]);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{mode === "edit" ? "Edit Akun" : "Tambah Akun"}</h3>
          <button
            className={styles.btnIcon}
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {err ? <div className={styles.alertError}>{err}</div> : null}

        <div className={styles.formGrid}>
          <label className={styles.label}>
            User ID
            <input
              className={styles.input}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={mode === "edit"}
              placeholder="contoh: ADM123"
            />
          </label>

          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className={styles.label}>
            Role
            <select
              className={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="admin_gudang">admin_gudang</option>
              <option value="kepala_gudang">kepala_gudang</option>
            </select>
          </label>

          <label className={styles.label} style={{ gridColumn: "1 / -1" }}>
            Password{" "}
            {mode === "edit" ? (
              <span className={styles.hint}>(kosongkan jika tidak diubah)</span>
            ) : null}
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.btnGhost}
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            Batal
          </button>

          <button
            className={styles.btnPrimary}
            disabled={saving}
            type="button"
            onClick={async () => {
              setSaving(true);
              setErr(null);

              try {
                const cleanUserId = userId.trim();
                const cleanUsername = username.trim();
                const cleanEmail = email.trim();

                // validasi basic sesuai schema kamu
                if (mode === "create") {
                  if (!cleanUserId) throw new Error("User ID wajib diisi");
                  if (cleanUsername.length < 3)
                    throw new Error("Username minimal 3 karakter");
                  if (!cleanEmail) throw new Error("Email wajib diisi");
                  if (!password) throw new Error("Password wajib diisi");
                  if (password.length < 6)
                    throw new Error("Password minimal 6 karakter");

                  await onSubmit({
                    userId: cleanUserId,
                    username: cleanUsername,
                    email: cleanEmail,
                    role,
                    password,
                  } satisfies CreateUserInput);
                } else {
                  if (cleanUsername.length < 3)
                    throw new Error("Username minimal 3 karakter");
                  if (!cleanEmail) throw new Error("Email wajib diisi");
                  if (password && password.length < 6)
                    throw new Error("Password minimal 6 karakter");

                  const payload: UpdateUserInput = {
                    username: cleanUsername,
                    email: cleanEmail,
                    role,
                  };
                  if (password) payload.password = password;

                  await onSubmit(payload);
                }
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Gagal menyimpan");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
