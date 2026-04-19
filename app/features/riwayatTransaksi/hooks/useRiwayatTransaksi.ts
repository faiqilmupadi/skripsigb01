"use client";

import { useState, useEffect, useCallback } from "react";
import type { TimePreset } from "@/app/types/timeRangeTypes";
import { fetchRiwayatTransaksi } from "../services/riwayatTransaksi.client";
import { MovementData } from "../types";

export function useRiwayatTransaksi() {
  const [preset, setPreset] = useState<TimePreset>("1m");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  
  const [rows, setRows] = useState<MovementData[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data setiap kali filter waktu berubah
  const loadData = useCallback(async () => {
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
      const data = await fetchRiwayatTransaksi(start, end);
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [preset, customStart, customEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Logika Cetak PDF
  const handlePrintPDF = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2>LAPORAN RIWAYAT TRANSAKSI GUDANG</h2>
          <p style="color: gray;">Periode: ${preset === 'custom' ? `${customStart} s/d ${customEnd}` : `Preset ${preset} Terakhir`}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Tanggal</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Tipe</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Dokumen</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Barang</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Qty</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">PIC</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => {
              const tipe = r.movementType === 'POTP123' ? 'Masuk (PO)' : 
                           r.movementType === 'SOTP123' ? 'Keluar (SO)' : 
                           r.movementType === 'KTP123' ? 'Hilang' : 
                           r.movementType === 'KTP124' || r.movementType === 'RTP123' ? 'Rusak' : 'Lainnya';
              const doc = r.nomorPurchaseOrder || r.nomorSalesOrder || '-';
              
              return `
                <tr>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">${r.postingDate}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${tipe}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">${doc}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">${r.kodeBarang} - ${r.namaBarang}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">${r.quantity} ${r.eum}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">${r.userName}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">${r.catatan || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${rows.length === 0 ? '<p style="text-align:center; padding: 20px;">Tidak ada transaksi pada periode ini.</p>' : ''}
      </div>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  return { preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd, rows, loading, handlePrintPDF };
}