import type { DashboardAnalisisResponse } from "../types";

export async function fetchDashboardAnalisis(
  query: string | URLSearchParams
): Promise<DashboardAnalisisResponse> {
  const qs = typeof query === "string" ? query : query.toString();

  const res = await fetch(`/api/kepalaGudang/dashboardAnalisis?${qs}`, {
    method: "GET",
    cache: "no-store",
  });

  return (await res.json()) as DashboardAnalisisResponse;
}