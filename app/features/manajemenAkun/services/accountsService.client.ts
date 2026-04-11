// app/features/manajemenAkun/services/accountsService.client.ts
import type { CreateUserInput, UpdateUserInput, UserRow } from "@/app/features/manajemenAkun/types";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; message: string; issues?: any };
type ApiRes<T> = ApiOk<T> | ApiErr;

function pickIssueMessage(issues: any): string | null {
  // zod flatten() biasanya:
  // { fieldErrors: { email: ["Email tidak valid"], password: ["min 6"] }, formErrors: [] }
  const fe = issues?.fieldErrors;
  if (fe && typeof fe === "object") {
    const firstKey = Object.keys(fe)[0];
    const firstMsg = Array.isArray(fe[firstKey]) ? fe[firstKey][0] : null;
    if (firstKey && firstMsg) return `${firstKey}: ${firstMsg}`;
  }
  const formErr = issues?.formErrors?.[0];
  if (formErr) return String(formErr);
  return null;
}

async function ensureOk<T>(res: Response): Promise<T> {
  let json: ApiRes<T> | null = null;

  try {
    json = (await res.json()) as ApiRes<T>;
  } catch {
    // non-json
  }

  if (!res.ok || !json || (json as any).ok !== true) {
    const base = (json && (json as ApiErr).message) || `Request gagal (${res.status})`;
    const detail = json && (json as ApiErr).issues ? pickIssueMessage((json as ApiErr).issues) : null;
    throw new Error(detail ? `${base} — ${detail}` : base);
  }

  return (json as ApiOk<T>).data;
}

export const accountsClient = {
  async list(): Promise<UserRow[]> {
    const res = await fetch("/api/kepalaGudang/manajemenAkun", { cache: "no-store" });
    return ensureOk<UserRow[]>(res);
  },

  async create(payload: CreateUserInput): Promise<UserRow> {
    const res = await fetch("/api/kepalaGudang/manajemenAkun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ensureOk<UserRow>(res);
  },

  async update(userId: string, payload: UpdateUserInput): Promise<UserRow> {
    const res = await fetch(`/api/kepalaGudang/manajemenAkun/${encodeURIComponent(userId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ensureOk<UserRow>(res);
  },

  async remove(userId: string): Promise<void> {
    const res = await fetch(`/api/kepalaGudang/manajemenAkun/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    await ensureOk<unknown>(res);
  },
};
