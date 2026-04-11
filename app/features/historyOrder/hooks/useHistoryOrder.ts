"use client";

import { useCallback, useEffect, useState } from "react";
import type { HistoryOrderRow } from "@/app/features/historyOrder/types";
import { historyOrderClient } from "@/app/features/historyOrder/services/historyOrderService.client";

export function useHistoryOrder(query: string) {
  const [rows, setRows] = useState<HistoryOrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyOrderClient.list(query);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rows, loading, error, refresh };
}
