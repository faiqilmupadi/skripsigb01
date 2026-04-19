"use client";

import { useState, useEffect, useCallback } from "react";
import { TimePreset } from "@/app/types/timeRangeTypes";
import { DashboardData, POStatusMonitor } from "../types";

export function useDashboardAnalisis() {
  const [preset, setPreset] = useState<TimePreset>("1m");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [data, setData] = useState<DashboardData | null>(null);
  const [poMonitor, setPoMonitor] = useState<POStatusMonitor[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("Sudah Dipesan");
  const [loading, setLoading] = useState(true);

  const fetchMainData = useCallback(async () => {
    setLoading(true);
    let start = customStart, end = customEnd;

    if (preset !== "custom") {
      const now = new Date();
      const d = new Date();
      if (preset === "24h") d.setDate(now.getDate() - 1);
      else if (preset === "7d") d.setDate(now.getDate() - 7);
      else if (preset === "1m") d.setMonth(now.getMonth() - 1);
      else if (preset === "3m") d.setMonth(now.getMonth() - 3);
      start = d.toISOString().split('T')[0];
      end = now.toISOString().split('T')[0];
    }

    if (!start || !end) return;

    try {
      const res = await fetch(`/api/ownerGudang/dashboardAnalisis?start=${start}&end=${end}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }, [preset, customStart, customEnd]);

  const fetchPOStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/ownerGudang/dashboardAnalisis?poStatus=${selectedStatus}`);
      const json = await res.json();
      setPoMonitor(json.data);
    } catch (e) { console.error(e); }
  }, [selectedStatus]);

  useEffect(() => { fetchMainData(); }, [fetchMainData]);
  useEffect(() => { fetchPOStatus(); }, [fetchPOStatus]);

  return {
    preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd,
    data, loading, poMonitor, selectedStatus, setSelectedStatus
  };
}