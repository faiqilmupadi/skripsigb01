"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchPurchaseOrders, addPurchaseOrder, submitReceivePO } from "../services/purchaseOrder.client";
import { PurchaseOrderFormData, PurchaseOrderGroup, VendorListOption, VendorOption, TransformEum } from "../types";
import type { TimePreset } from "@/app/types/timeRangeTypes";

export function usePurchaseOrder() {
  const [rows, setRows] = useState<PurchaseOrderGroup[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [vendorLists, setVendorLists] = useState<VendorListOption[]>([]);
  const [transformList, setTransformList] = useState<TransformEum[]>([]); // Menyimpan aturan konversi
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timePreset, setTimePreset] = useState<TimePreset>("3m");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<PurchaseOrderGroup | null>(null);

  const [receiveTarget, setReceiveTarget] = useState<PurchaseOrderGroup | null>(null);
  const [receiveCatatan, setReceiveCatatan] = useState("");
  const [receiveItems, setReceiveItems] = useState<{
    kodeBarang: string, namaBarang: string, qtyPesanAsli: number, eumAsli: string, 
    qtyPesanBase: number, qtyDiterima: number, eum: string, conversionFactor: number
  }[]>([]);
  
  const [isReceiving, setIsReceiving] = useState(false);
  const isOverReceiving = receiveItems.some(item => item.qtyDiterima > item.qtyPesanBase);

  const [form, setForm] = useState<PurchaseOrderFormData>({ kodeVendor: "", namaVendor: "", items: [] });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPurchaseOrders();
      setRows(res.data);
      setVendors(res.options.vendors);
      setVendorLists(res.options.vendorLists);
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

  function openReceiveModal(row: PurchaseOrderGroup) {
    setReceiveTarget(row); setReceiveCatatan("");
    setReceiveItems(row.items.map(i => ({
      kodeBarang: i.kodeBarang, namaBarang: i.namaBarang, qtyPesanAsli: i.qty, eumAsli: i.eum,
      qtyPesanBase: i.baseQty, qtyDiterima: i.baseQty, eum: i.baseEum, conversionFactor: i.conversionFactor
    })));
  }

  function handleReceiveQtyChange(index: number, newQty: number) {
    setReceiveItems(prev => { const copy = [...prev]; copy[index].qtyDiterima = newQty < 0 ? 0 : newQty; return copy; });
  }

  async function handleReceivePO() {
    if (!receiveTarget) return; setIsReceiving(true);
    try {
      await submitReceivePO(receiveTarget.nomorPurchaseOrder, receiveCatatan, receiveItems);
      setReceiveTarget(null); setReceiveItems([]); setReceiveCatatan(""); await load();
    } catch (e: any) { setError(e.message); } finally { setIsReceiving(false); }
  }

  function handleVendorChange(kodeVendor: string) {
    const found = vendors.find(v => v.kodeVendor === kodeVendor);
    setForm(prev => ({ ...prev, kodeVendor, namaVendor: found?.namaVendor || "", items: [] }));
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { kodeBarang: "", namaBarang: "", qty: 1, eum: "", baseQty: 1, baseEum: "", conversionFactor: 1, hargaSatuan: 0, totalHarga: 0 }] }));
  }

  function removeItem(index: number) {
    setForm(prev => { const newItems = [...prev.items]; newItems.splice(index, 1); return { ...prev, items: newItems }; });
  }

  // Logika Matematika Konversi (Dus -> Pcs)
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
    const found = vendorLists.find(v => v.kodeBarang === kodeBarang && v.kodeVendor === form.kodeVendor);
    setForm(prev => {
      const newItems = [...prev.items];
      if (found) { 
        const multiplier = getMultiplier(found.kodeBarang, found.eum, found.baseEum);
        newItems[index] = { 
            ...newItems[index], 
            kodeBarang: found.kodeBarang, 
            namaBarang: found.namaBarang, 
            eum: found.eum, // Mengunci unit ke unit Vendor (Wajib Dus/Kantong)
            baseEum: found.baseEum,
            conversionFactor: multiplier,
            baseQty: newItems[index].qty * multiplier, // Kalkulasi otomatis
            hargaSatuan: found.hargaDariVendor, 
            totalHarga: found.hargaDariVendor * newItems[index].qty 
        }; 
      }
      return { ...prev, items: newItems };
    });
  }

  function handleQtyChange(index: number, qty: number) {
    setForm(prev => {
      const newItems = [...prev.items]; 
      newItems[index].qty = qty; 
      newItems[index].baseQty = qty * newItems[index].conversionFactor; // Update konversi secara live
      newItems[index].totalHarga = newItems[index].hargaSatuan * qty; 
      return { ...prev, items: newItems };
    });
  }

  async function handleSave() {
    if (!form.kodeVendor || form.items.length === 0) return setError("Pilih Vendor dan minimal 1 barang.");
    if (form.items.some(i => !i.kodeBarang || i.qty < 1)) return setError("Pastikan semua baris barang telah dipilih dan Qty minimal 1.");
    setSaving(true);
    try {
      await addPurchaseOrder(form); setFormOpen(false); setForm({ kodeVendor: "", namaVendor: "", items: [] }); await load();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  }

  return {
    rows: filteredRows, timePreset, setTimePreset, customStart, setCustomStart, customEnd, setCustomEnd,
    vendors, vendorLists, loading, saving, error, form, formOpen, setFormOpen, viewTarget, setViewTarget,
    receiveTarget, setReceiveTarget, receiveCatatan, setReceiveCatatan, isReceiving, receiveItems, isOverReceiving, handleReceivePO, openReceiveModal, handleReceiveQtyChange,
    handleVendorChange, handleItemChange, handleQtyChange, addItem, removeItem, handleSave, setForm
  };
}