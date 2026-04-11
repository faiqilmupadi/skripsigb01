"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchDashboardAnalisis } from "../services/dashboardService";
import type { DashboardAnalisisResponse } from "../types";

export function useDashboardAnalisis(query: string | URLSearchParams) {
  const [data, setData] = useState<DashboardAnalisisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const key = useMemo(() => (typeof query === "string" ? query : query.toString()), [query]);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchDashboardAnalisis(key)
      .then((d) => {
        if (alive) setData(d);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [key]);

  return { data, loading };
}