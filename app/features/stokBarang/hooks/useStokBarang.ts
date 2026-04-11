// C:\Faiq\skripsi\skripsiku\app\features\stokBarang\hooks\useStokBarang.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  StockRow,
  LowStockRow,
  RestockNeedQCRow,
  TakePayload,
  ReturnPayload,
  RestockRequestPayload,
  RestockReceivePayload,
} from "@/app/features/stokBarang/types";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; message: string };
type ApiRes<T> = ApiOk<T> | ApiErr;

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as ApiRes<T> | null;
  if (!res.ok || !json || (json as any).ok !== true) {
    const msg = (json as any)?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return (json as ApiOk<T>).data;
}

export function useStokBarang() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [lowStock, setLowStock] = useState<LowStockRow[]>([]);
  const [needQC, setNeedQC] = useState<RestockNeedQCRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<StockRow[]>("/api/adminGudang/stokBarang");
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const [low, qc] = await Promise.all([
        apiJson<LowStockRow[]>("/api/adminGudang/stokBarang/lowStock"),
        apiJson<RestockNeedQCRow[]>("/api/adminGudang/stokBarang/restock/needQC"),
      ]);
      setLowStock(low);
      setNeedQC(qc);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    refreshNotifications();
  }, [refresh, refreshNotifications]);

  const actions = useMemo(() => {
    return {
      async take(payload: TakePayload) {
        await apiJson("/api/adminGudang/stokBarang/take", { method: "POST", body: JSON.stringify(payload) });
        await refresh();
        await refreshNotifications();
      },

      async return(payload: ReturnPayload) {
        await apiJson("/api/adminGudang/stokBarang/return", { method: "POST", body: JSON.stringify(payload) });
        await refresh();
        await refreshNotifications();
      },

      async requestRestock(payload: RestockRequestPayload) {
        await apiJson("/api/adminGudang/stokBarang/restock/request", { method: "POST", body: JSON.stringify(payload) });
        // request bikin entry needQC langsung (karena requestedQty>0 + quantity=0)
        await refreshNotifications();
      },

      async receiveRestock(payload: RestockReceivePayload) {
        await apiJson("/api/adminGudang/stokBarang/restock/receive", { method: "POST", body: JSON.stringify(payload) });
        await refresh();
        await refreshNotifications();
      },
    };
  }, [refresh, refreshNotifications]);

  return { rows, lowStock, needQC, loading, notifLoading, error, refresh, refreshNotifications, actions };
}
