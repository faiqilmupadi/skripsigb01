"use client";

import { useMemo, useState } from "react";
import type { TimePreset } from "@/app/types/timeRangeTypes";

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function normalizeYmd(input: string) {
  const s = String(input ?? "").trim();
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function orderRange(a: string, b: string) {
  const start = normalizeYmd(a);
  const end = normalizeYmd(b);
  if (!start || !end) return { from: start || undefined, to: end || undefined };
  return start <= end ? { from: start, to: end } : { from: end, to: start };
}

export function useTimeRange(defaultPreset: TimePreset = "7d") {
  const [preset, setPreset] = useState<TimePreset>(defaultPreset);

  const today = useMemo(() => new Date(), []);
  const [customStart, setCustomStart] = useState<string>(toYmd(addDays(today, -6)));
  const [customEnd, setCustomEnd] = useState<string>(toYmd(today));

  // query string buat API list/table kamu (tetap seperti sekarang)
  const query = useMemo(() => {
    if (preset === "custom") {
      const start = normalizeYmd(customStart);
      const end = normalizeYmd(customEnd);
      return `preset=custom&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    }
    return `preset=${preset}`;
  }, [preset, customStart, customEnd]);

  // range object buat EXPORT (from/to)
  const range = useMemo(() => {
    if (preset === "custom") {
      return orderRange(customStart, customEnd);
    }

    const to = toYmd(today);

    // ✅ 24 jam = dari kemarin sampai hari ini (date-only).
    // Backend kamu sudah: postingDate >= from dan postingDate < to+1 day,
    // jadi ini akan cover 2 tanggal (kemarin + hari ini). Kalau kamu maunya "HANYA hari ini", bilang.
    if (preset === "24h") return { from: toYmd(addDays(today, -1)), to };
    if (preset === "7d") return { from: toYmd(addDays(today, -7)), to };
    if (preset === "1m") return { from: toYmd(addMonths(today, -1)), to };
    if (preset === "3m") return { from: toYmd(addMonths(today, -3)), to };

    return { from: undefined as string | undefined, to: undefined as string | undefined };
  }, [preset, customStart, customEnd, today]);

  // sanitasi input custom agar selalu YYYY-MM-DD
  function setCustomStartSafe(v: string) {
    setCustomStart(normalizeYmd(v));
  }

  function setCustomEndSafe(v: string) {
    setCustomEnd(normalizeYmd(v));
  }

  return {
    preset,
    setPreset,
    customStart,
    setCustomStart: setCustomStartSafe,
    customEnd,
    setCustomEnd: setCustomEndSafe,
    query,
    range,
  };
}
