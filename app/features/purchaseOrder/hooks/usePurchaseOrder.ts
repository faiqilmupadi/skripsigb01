"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchPurchaseOrders, addPurchaseOrder, submitReceivePO } from "../services/purchaseOrder.client";
import { PurchaseOrderFormData, PurchaseOrderGroup, VendorListOption, VendorOption } from "../types";
import type { TimePreset } from "@/app/types/timeRangeTypes"; // Pastikan tipe ini ada

export function usePurchaseOrder() {
  const [rows, setRows] = useState<PurchaseOrderGroup[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [vendorLists, setVendorLists] = useState<VendorListOption[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- STATE UNTUK FILTER WAKTU ---
  const [timePreset, setTimePreset] = useState<TimePreset>("3m"); // Default 3 bulan terakhir
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
      
      if (!applyFilter) return true; // Tampilkan semua jika tidak ada filter valid
      return rowDate >= pastDate && rowDate <= now;
    });
  }, [rows, timePreset, customStart, customEnd]);

  // ... (Fungsi Modal, Save, Receive tetap sama, tidak ada yang diubah)
  function openReceiveModal(row: PurchaseOrderGroup) {
    setReceiveTarget(row); setReceiveCatatan("");
    setReceiveItems(row.items.map(i => ({
      kodeBarang: i.kodeBarang, namaBarang: i.namaBarang, qtyPesanAsli: i.qty, eumAsli: i.eum,
      qtyPesanBase: i.baseQty, qtyDiterima: i.baseQty, eum: i.baseEum, conversionFactor: i.conversionFactor
    })));
  }

  function handleReceiveQtyChange(index: number, newQty: number) {
    setReceiveItems(prev => {
      const copy = [...prev]; copy[index].qtyDiterima = newQty < 0 ? 0 : newQty; return copy;
    });
  }

  async function handleReceivePO() {
    if (!receiveTarget) return;
    setIsReceiving(true);
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

  function handleItemChange(index: number, kodeBarang: string) {
    const found = vendorLists.find(v => v.kodeBarang === kodeBarang && v.kodeVendor === form.kodeVendor);
    setForm(prev => {
      const newItems = [...prev.items];
      if (found) { newItems[index] = { ...newItems[index], kodeBarang: found.kodeBarang, namaBarang: found.namaBarang, eum: found.eum, hargaSatuan: found.hargaDariVendor, totalHarga: found.hargaDariVendor * newItems[index].qty }; }
      return { ...prev, items: newItems };
    });
  }

  function handleQtyChange(index: number, qty: number) {
    setForm(prev => {
      const newItems = [...prev.items]; newItems[index].qty = qty; newItems[index].totalHarga = newItems[index].hargaSatuan * qty; return { ...prev, items: newItems };
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
    rows: filteredRows, // <-- Ekspor rows yang SUDAH DIFILTER
    timePreset, setTimePreset, customStart, setCustomStart, customEnd, setCustomEnd, // <-- Ekspor State Filter
    vendors, vendorLists, loading, saving, error,
    form, formOpen, setFormOpen, viewTarget, setViewTarget,
    receiveTarget, setReceiveTarget, receiveCatatan, setReceiveCatatan, isReceiving, receiveItems, isOverReceiving, handleReceivePO, openReceiveModal, handleReceiveQtyChange,
    handleVendorChange, handleItemChange, handleQtyChange, addItem, removeItem, handleSave, setForm
  };
}