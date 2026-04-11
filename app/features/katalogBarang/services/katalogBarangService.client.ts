// app/features/katalogBarang/services/katalogBarangService.client.ts
import type { CreateBarangInput, KatalogBarangRow, UpdateBarangInput } from "@/app/features/katalogBarang/types";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; message: string; issues?: any };
type ApiRes<T> = ApiOk<T> | ApiErr;

function pickIssueMessage(issues: any): string | null {
  const fe = issues?.fieldErrors;
  if (fe && typeof fe === "object") {
    const k = Object.keys(fe)[0];
    const msg = Array.isArray(fe[k]) ? fe[k][0] : null;
    if (k && msg) return `${k}: ${msg}`;
  }
  const formErr = issues?.formErrors?.[0];
  return formErr ? String(formErr) : null;
}

async function ensureOk<T>(res: Response): Promise<T> {
  let json: ApiRes<T> | null = null;
  try {
    json = (await res.json()) as ApiRes<T>;
  } catch {}

  if (!res.ok || !json || (json as any).ok !== true) {
    const base = (json && (json as ApiErr).message) || `Request gagal (${res.status})`;
    const detail = json && (json as ApiErr).issues ? pickIssueMessage((json as ApiErr).issues) : null;
    throw new Error(detail ? `${base} — ${detail}` : base);
  }
  return (json as ApiOk<T>).data;
}

function makeKey(partNumber: string, plant: string) {
  return `${partNumber}__${plant}`;
}

export const katalogBarangClient = {
  async list(): Promise<KatalogBarangRow[]> {
    const res = await fetch("/api/kepalaGudang/katalogBarang", { cache: "no-store" });
    return ensureOk<KatalogBarangRow[]>(res);
  },

  async create(payload: CreateBarangInput): Promise<KatalogBarangRow> {
    const res = await fetch("/api/kepalaGudang/katalogBarang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ensureOk<KatalogBarangRow>(res);
  },

  async update(partNumber: string, plant: string, payload: UpdateBarangInput): Promise<KatalogBarangRow> {
    const key = makeKey(partNumber, plant);
    const res = await fetch(`/api/kepalaGudang/katalogBarang/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ensureOk<KatalogBarangRow>(res);
  },

  async remove(partNumber: string, plant: string): Promise<void> {
    const key = makeKey(partNumber, plant);
    const res = await fetch(`/api/kepalaGudang/katalogBarang/${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
    await ensureOk<unknown>(res);
  },
};
