// app/features/historyOrder/services/historyOrderService.client.ts
import type { HistoryOrderRow } from "@/app/features/historyOrder/types";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; message: string; issues?: unknown };
type ApiRes<T> = ApiOk<T> | ApiErr;

async function ensureOk<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiRes<T>;
  if (!res.ok || json.ok !== true) {
    throw new Error(json.ok === false ? json.message : "Request gagal");
  }
  return json.data;
}

export const historyOrderClient = {
  // query contoh: "preset=7d" atau "preset=custom&start=2026-02-01&end=2026-02-12"
  async list(query: string): Promise<HistoryOrderRow[]> {
    const url = query?.trim()
      ? `/api/kepalaGudang/historyOrder?${query}`
      : `/api/kepalaGudang/historyOrder?preset=7d`;

    const res = await fetch(url, { cache: "no-store" });
    return ensureOk<HistoryOrderRow[]>(res);
  },
};
