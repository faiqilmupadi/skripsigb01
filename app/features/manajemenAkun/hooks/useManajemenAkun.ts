"use client";

import { useState, useEffect, useCallback } from "react";
import { TabType, UserAkun, VendorData } from "../types";
import { manajemenClient } from "../services/manajemenAkun.client";

export function useManajemenAkun() {
  const [activeTab, setActiveTab] = useState<TabType>("admin");
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null); // Null = Create, Object = Edit
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await manajemenClient.fetchList(activeTab);
      setDataList(data);
    } catch (err: any) {
      alert("Gagal memuat data: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenForm = (data?: any) => {
    setErrorMsg("");
    setFormData(data || null);
    setFormOpen(true);
  };

  const handleSave = async (payload: any) => {
    setSaving(true);
    setErrorMsg("");
    try {
      const isEdit = !!formData;
      const id = activeTab === "vendor" ? payload.kodeVendor : payload.userId;

      if (isEdit) await manajemenClient.update(activeTab, id, payload);
      else await manajemenClient.create(activeTab, payload);

      setFormOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await manajemenClient.remove(activeTab, id);
      loadData();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return {
    activeTab, setActiveTab, dataList, loading,
    formOpen, setFormOpen, formData, saving, errorMsg,
    handleOpenForm, handleSave, handleDelete
  };
}