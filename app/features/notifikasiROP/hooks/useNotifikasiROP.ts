"use client";

import { useState, useEffect } from "react";
import { fetchNotifikasiROP } from "../services/notifikasiROP.client";
import { LowStockItem } from "../types";

export function useNotifikasiROP() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Cek apakah di sesi (tab browser) ini user sudah pernah menyilang notifikasi
    const isDismissed = sessionStorage.getItem("rop_dismissed");
    
    if (isDismissed === "true") {
      return; // Jangan tampilkan jika sudah di-silang di sesi ini
    }

    // Ambil data dari server
    fetchNotifikasiROP()
      .then(res => {
        if (res.data && res.data.length > 0) {
          setItems(res.data);
          setVisible(true);
        }
      })
      .catch(err => console.error("ROP Error:", err));
  }, []);

  const dismiss = () => {
    setVisible(false);
    // Simpan status bahwa user sudah menyilang di sesi ini
    sessionStorage.setItem("rop_dismissed", "true");
  };

  return { items, visible, dismiss };
}