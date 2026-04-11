import type { Formatter } from "recharts/types/component/DefaultTooltipContent";

export function fmtNum(v: number) {
  if (!isFinite(v)) return "-";
  return new Intl.NumberFormat("id-ID").format(v);
}

export const numTooltipFormatter: Formatter<number | string, string> = (value) => {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return fmtNum(n);
};
