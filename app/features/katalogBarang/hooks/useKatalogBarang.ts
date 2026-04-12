"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreateBarangInput, KatalogBarangRow, UpdateBarangInput } from "@/app/features/katalogBarang/types";
import { katalogBarangClient } from "@/app/features/katalogBarang/services/katalogBarangService.client";

export function useKatalogBarang() {
  const [rows, setRows] = useState<KatalogBarangRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await katalogBarangClient.list();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const actions = useMemo(() => ({
    refresh,
    async create(payload: CreateBarangInput) {
      await katalogBarangClient.create(payload);
      await refresh();
    },
  async update(kodeBarang: string, payload: UpdateBarangInput) {
    await katalogBarangClient.update(kodeBarang, payload);
    await refresh();
  },
    async remove(kodeBarang: string) {
      await katalogBarangClient.remove(kodeBarang);
      await refresh();
    },
  }), [refresh]);

  return { rows, loading, error, actions };
}