"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addVendorList,
  editVendorList,
  fetchVendorList,
  fetchVendors,
  removeVendorList,
} from "../services/vendorListServices.client";
import { Vendor, VendorList, VendorListFormData } from "../types";

const EMPTY_FORM: VendorListFormData = {
  kodeVendor: "",
  namaVendor: "",
  kodeBarang: "",
  eum: "",
};

export function useVendorList() {
  const [rows, setRows] = useState<VendorList[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VendorList | null>(null);
  const [form, setForm] = useState<VendorListFormData>(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState<VendorList | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listData, vendorData] = await Promise.all([
        fetchVendorList(),
        fetchVendors(),
      ]);
      setRows(listData);
      setVendors(vendorData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleKodeVendorChange(kodeVendor: string) {
    const found = vendors.find((v) => v.kodeVendor === kodeVendor);
    setForm((prev) => ({
      ...prev,
      kodeVendor,
      namaVendor: found?.namaVendor ?? "",
    }));
  }

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(row: VendorList) {
    setEditTarget(row);
    setForm({
      kodeVendor: row.kodeVendor,
      namaVendor: row.namaVendor,
      kodeBarang: row.kodeBarang,
      eum: row.eum,
    });
    setError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setError(null);
  }

  async function handleSave() {
    if (!form.kodeVendor.trim() || !form.kodeBarang.trim() || !form.eum.trim()) {
      setError("Kode vendor, kode barang, dan EuM wajib diisi");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editTarget) {
        await editVendorList(editTarget.kodeVendor, editTarget.kodeBarang, {
          eum: form.eum,
        });
      } else {
        await addVendorList(form);
      }
      closeForm();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function openDelete(row: VendorList) {
    setDeleteTarget(row);
  }

  function closeDelete() {
    setDeleteTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeVendorList(deleteTarget.kodeVendor, deleteTarget.kodeBarang);
      closeDelete();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return {
    rows, vendors, loading, saving, error, deleting,
    formOpen, editTarget, form, setForm,
    deleteTarget,
    openAdd, openEdit, closeForm, handleSave,
    openDelete, closeDelete, handleDelete,
    handleKodeVendorChange,
  };
}