// app/features/manajemenAkun/types.ts
import { z } from "zod";

export const USER_ROLES = ["admin_gudang", "kepala_gudang"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserRow = {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  createdOn: string; // ISO
  lastChange: string | null; // ISO | null
};

export type CreateUserInput = {
  userId: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
};

// ✅ userId tidak boleh diubah
export type UpdateUserInput = Partial<Omit<CreateUserInput, "userId">>;

// =========================
// Zod Schemas
// =========================
export const CreateUserSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, "User ID wajib diisi")
    .max(50, "User ID maksimal 50 karakter"),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(100, "Username maksimal 100 karakter"),
  email: z
    .string()
    .trim()
    .email("Email tidak valid")
    .max(150, "Email maksimal 150 karakter"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(255, "Password maksimal 255 karakter"),
  role: z.enum(USER_ROLES, { message: "Role tidak valid" }),
});

export const UpdateUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter")
      .max(100, "Username maksimal 100 karakter")
      .optional(),
    email: z
      .string()
      .trim()
      .email("Email tidak valid")
      .max(150, "Email maksimal 150 karakter")
      .optional(),
    password: z
      .string()
      .min(6, "Password minimal 6 karakter")
      .max(255, "Password maksimal 255 karakter")
      .optional(),
    role: z.enum(USER_ROLES, { message: "Role tidak valid" }).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "Minimal 1 field diubah",
  });

// (opsional) tipe hasil parse
export type CreateUserParsed = z.infer<typeof CreateUserSchema>;
export type UpdateUserParsed = z.infer<typeof UpdateUserSchema>;
