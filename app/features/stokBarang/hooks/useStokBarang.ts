"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchStokBarang, submitStockAdjustment } from "../services/stokBarang.client";
import { StokBarang, AdjustmentType } from "../types";

export function useStokBarang() {
  const [rows, setRows] = useState<StokBarang[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStok, setSelectedStok] = useState<StokBarang | null>(null);
  
  const [tipe, setTipe] = useState<AdjustmentType>("Hilang");
  const [qty, setQty] = useState<number | "">("");
  const [catatan, setCatatan] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStokBarang();
      setRows(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Menghitung batas maksimal input dinamis
  let maxQty = 0;
  if (selectedStok) {
    if (tipe === "Hilang" || tipe === "Rusak") maxQty = selectedStok.barangSiap;
    if (tipe === "Ketemu") maxQty = selectedStok.barangHilang;
  }

  function openModal(stok: StokBarang) {
    setSelectedStok(stok);
    setTipe("Hilang");
    setQty("");
    setCatatan("");
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedStok(null);
  }

  async function handleSave() {
    if (!selectedStok) return;
    const numQty = Number(qty);
    if (!qty || numQty <= 0) return setError("Kuantitas harus diisi minimal 1.");
    if (numQty > maxQty) return setError(`Maksimal kuantitas untuk opsi ini adalah ${maxQty}.`);
    if (!catatan.trim()) return setError("Catatan wajib diisi sebagai alasan penyesuaian.");

    setSaving(true);
    setError(null);
    try {
      await submitStockAdjustment({
        kodeBarang: selectedStok.kodeBarang,
        tipe,
        qty: numQty,
        catatan
      });
      closeModal();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return {
    rows, loading, saving, error, setError,
    modalOpen, selectedStok, openModal, closeModal, handleSave,
    tipe, setTipe, qty, setQty, catatan, setCatatan, maxQty
  };
}