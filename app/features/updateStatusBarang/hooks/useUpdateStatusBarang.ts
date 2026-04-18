"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchVendorData, updateStatusPO } from "../services/updateStatusBarang.client";
import { POVendorGroup, VendorInfo } from "../types";
import type { TimePreset } from "@/app/types/timeRangeTypes";

export function useUpdateStatusBarang() {
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [rows, setRows] = useState<POVendorGroup[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- STATE FILTER WAKTU ---
  const [timePreset, setTimePreset] = useState<TimePreset>("3m"); 
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [updateTarget, setUpdateTarget] = useState<POVendorGroup | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchVendorData();
      setVendorInfo(res.vendorInfo);
      setRows(res.data);
    } catch (e: any) {
      setError(e.message);
      setVendorInfo(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- LOGIKA FILTER WAKTU ---
  const filteredRows = useMemo(() => {
    if (!rows.length) return [];
    
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    const pastDate = new Date();
    pastDate.setHours(0, 0, 0, 0);

    let applyFilter = true;

    switch (timePreset) {
      case "24h": pastDate.setDate(now.getDate() - 1); break;
      case "7d": pastDate.setDate(now.getDate() - 7); break;
      case "1m": pastDate.setMonth(now.getMonth() - 1); break;
      case "3m": pastDate.setMonth(now.getMonth() - 3); break;
      case "custom": applyFilter = false; break;
      default: applyFilter = false;
    }

    return rows.filter(row => {
      const rowDate = new Date(row.tanggal);
      
      if (timePreset === "custom") {
         const start = customStart ? new Date(customStart) : new Date("2000-01-01");
         const end = customEnd ? new Date(customEnd) : new Date("2099-12-31");
         start.setHours(0, 0, 0, 0);
         end.setHours(23, 59, 59, 999);
         return rowDate >= start && rowDate <= end;
      }
      
      if (!applyFilter) return true; 
      return rowDate >= pastDate && rowDate <= now;
    });
  }, [rows, timePreset, customStart, customEnd]);

  function openUpdateModal(row: POVendorGroup) {
    setUpdateTarget(row);
    setNewStatus(row.status); 
  }

  function closeUpdateModal() {
    setUpdateTarget(null);
    setNewStatus("");
  }

  async function handleUpdateStatus() {
    if (!updateTarget || !vendorInfo) return;
    setUpdating(true);
    try {
      await updateStatusPO(updateTarget.nomorPurchaseOrder, vendorInfo.kodeVendor, newStatus);
      closeUpdateModal();
      await loadData(); 
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  }

  return {
    vendorInfo, 
    rows: filteredRows, // <-- Ekspor rows yang difilter
    timePreset, setTimePreset, customStart, setCustomStart, customEnd, setCustomEnd,
    loading, updating, error,
    updateTarget, newStatus, setNewStatus,
    openUpdateModal, closeUpdateModal, handleUpdateStatus
  };
}