"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addVendor,
  editVendor,
  fetchVendors,
  removeVendor,
} from "../services/vendorListServices.client";
import { Vendor, VendorFormData } from "../types";

const EMPTY_FORM: VendorFormData = {
  kodeVendor: "",
  namaVendor: "",
  alamat: "",
};

export function useVendor() {
  const [rows, setRows] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [form, setForm] = useState<VendorFormData>(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchVendors());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(row: Vendor) {
    setEditTarget(row);
    setForm({
      kodeVendor: row.kodeVendor,
      namaVendor: row.namaVendor,
      alamat: row.alamat,
    });
    setError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setError(null);
  }

  async function handleSave() {
    if (!form.kodeVendor.trim() || !form.namaVendor.trim()) {
      setError("Kode dan nama vendor wajib diisi");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editTarget) {
        await editVendor(editTarget.kodeVendor, {
          namaVendor: form.namaVendor,
          alamat: form.alamat,
        });
      } else {
        await addVendor(form);
      }
      closeForm();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function openDelete(row: Vendor) {
    setDeleteTarget(row);
  }

  function closeDelete() {
    setDeleteTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeVendor(deleteTarget.kodeVendor);
      closeDelete();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return {
    rows, loading, saving, error, deleting,
    formOpen, editTarget, form, setForm,
    deleteTarget,
    openAdd, openEdit, closeForm, handleSave,
    openDelete, closeDelete, handleDelete,
  };
}