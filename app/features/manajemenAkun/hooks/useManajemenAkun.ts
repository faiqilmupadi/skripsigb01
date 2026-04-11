// app/features/manajemenAkun/hooks/useManajemenAkun.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreateUserInput, UpdateUserInput, UserRow } from "@/app/features/manajemenAkun/types";
import { accountsClient } from "@/app/features/manajemenAkun/services/accountsService.client";

export function useManajemenAkun() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountsClient.list();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const actions = useMemo(
    () => ({
      refresh,

      async create(payload: CreateUserInput) {
        await accountsClient.create(payload);
        await refresh();
      },

      async update(userId: string, payload: UpdateUserInput) {
        await accountsClient.update(userId, payload);
        await refresh();
      },

      async remove(userId: string) {
        await accountsClient.remove(userId);
        await refresh();
      },
    }),
    [refresh]
  );

  return { rows, loading, error, actions };
}
