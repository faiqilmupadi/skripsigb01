"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchSalesOrders, addSalesOrder } from "../services/salesOrder.client";
import { SalesOrderFormData, SalesOrderGroup, BarangOption, TransformEum } from "../types";
import type { TimePreset } from "@/app/types/timeRangeTypes";

export function useSalesOrder() {
  const [rows, setRows] = useState<SalesOrderGroup[]>([]);
  const [barangList, setBarangList] = useState<BarangOption[]>([]);
  const [transformList, setTransformList] = useState<TransformEum[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timePreset, setTimePreset] = useState<TimePreset>("3m");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<SalesOrderGroup | null>(null);

  const [form, setForm] = useState<SalesOrderFormData>({ items: [] });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSalesOrders();
      setRows(res.data);
      setBarangList(res.options.barangList);
      setTransformList(res.options.transformList);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredRows = useMemo(() => {
    if (!rows.length) return [];
    const now = new Date(); now.setHours(23, 59, 59, 999);
    const pastDate = new Date(); pastDate.setHours(0, 0, 0, 0);
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
         start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
         return rowDate >= start && rowDate <= end;
      }
      if (!applyFilter) return true;
      return rowDate >= pastDate && rowDate <= now;
    });
  }, [rows, timePreset, customStart, customEnd]);

  function addItem() {
    setForm(prev => ({ items: [...prev.items, { kodeBarang: "", namaBarang: "", qty: 1, eum: "", hargaSatuan: 0, totalHarga: 0 }] }));
  }

  function removeItem(index: number) {
    setForm(prev => { const newItems = [...prev.items]; newItems.splice(index, 1); return { items: newItems }; });
  }

  // Fungsi helper mencari pengali (multiplier) dari satuan Besar ke Kecil (Base)
  const getMultiplier = (kodeBarang: string, fromEum: string, toEum: string) => {
      if (!fromEum || !toEum || fromEum.toLowerCase() === toEum.toLowerCase()) return 1;
      const rules = transformList.filter(t => t.kodeBarang === kodeBarang);
      let currentEum = fromEum;
      let multiplier = 1;
      let maxLoop = 5;
      while(currentEum.toLowerCase() !== toEum.toLowerCase() && maxLoop > 0) {
          const rule = rules.find(r => r.eumFrom.toLowerCase() === currentEum.toLowerCase());
          if (!rule) break; 
          multiplier *= (rule.qtyTo / rule.qtyFrom);
          currentEum = rule.eumTo;
          maxLoop--;
      }
      return multiplier;
  }

  function handleItemChange(index: number, kodeBarang: string) {
    const found = barangList.find(b => b.kodeBarang === kodeBarang);
    setForm(prev => {
      const newItems = [...prev.items];
      if (found) {
        const selectedEum = found.hargaEum || found.baseEum;
        newItems[index] = { 
            ...newItems[index], 
            kodeBarang: found.kodeBarang, 
            namaBarang: found.namaBarang, 
            eum: selectedEum, 
            hargaSatuan: found.hargaJual, 
            totalHarga: found.hargaJual * newItems[index].qty 
        };
      }
      return { items: newItems };
    });
  }

  function handleEumChange(index: number, newEum: string) {
    setForm(prev => {
        const newItems = [...prev.items];
        const item = newItems[index];
        const found = barangList.find(b => b.kodeBarang === item.kodeBarang);
        
        if (found) {
            // 1. Cari harga per satuan terkecil (Base Pcs)
            const baseMultiplier = getMultiplier(found.kodeBarang, found.hargaEum, found.baseEum);
            const pricePerBase = baseMultiplier > 0 ? found.hargaJual / baseMultiplier : found.hargaJual;
            
            // 2. Kalikan dengan satuan baru yang dipilih (Misal dari Pcs ke Kantong)
            const newEumMultiplier = getMultiplier(found.kodeBarang, newEum, found.baseEum);
            const newHargaSatuan = pricePerBase * newEumMultiplier;

            newItems[index] = {
                ...item,
                eum: newEum,
                hargaSatuan: newHargaSatuan,
                totalHarga: newHargaSatuan * item.qty
            };
        }
        return { items: newItems };
    });
  }

  function handleQtyChange(index: number, qty: number) {
    setForm(prev => {
      const newItems = [...prev.items];
      newItems[index].qty = qty;
      newItems[index].totalHarga = newItems[index].hargaSatuan * qty;
      return { items: newItems };
    });
  }

  async function handleSave() {
    if (form.items.length === 0) return setError("Minimal pilih 1 barang untuk dikeluarkan.");
    if (form.items.some(i => !i.kodeBarang || i.qty < 1)) return setError("Pastikan barang telah dipilih dan Qty minimal 1.");
    
    setSaving(true); setError(null);
    try {
      await addSalesOrder(form);
      setFormOpen(false); setForm({ items: [] });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return {
    rows: filteredRows, barangList, transformList, loading, saving, error, setError,
    timePreset, setTimePreset, customStart, setCustomStart, customEnd, setCustomEnd,
    form, formOpen, setFormOpen, viewTarget, setViewTarget,
    handleItemChange, handleEumChange, handleQtyChange, addItem, removeItem, handleSave, getMultiplier
  };
}