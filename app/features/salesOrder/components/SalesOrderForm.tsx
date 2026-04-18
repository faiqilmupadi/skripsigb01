"use client";

import Form from "@/app/components/shared/Form";
import { SalesOrderFormData, BarangOption, TransformEum } from "../types";
import styles from "@/styles/manajemenAkun.module.css";

type Props = {
  open: boolean; saving: boolean; error: string | null; form: SalesOrderFormData; 
  barangList: BarangOption[]; transformList: TransformEum[];
  onClose: () => void; onSubmit: () => Promise<void>; 
  handleItemChange: (index: number, kodeBarang: string) => void;
  handleEumChange: (index: number, eum: string) => void;
  handleQtyChange: (index: number, qty: number) => void; 
  addItem: () => void; removeItem: (index: number) => void;
  getMultiplier: (kode: string, from: string, to: string) => number;
};

export default function SalesOrderForm({ 
  open, saving, error, form, barangList, transformList, onClose, onSubmit, 
  handleItemChange, handleEumChange, handleQtyChange, addItem, removeItem, getMultiplier 
}: Props) {
  
  return (
    <Form open={open} title="Buat Sales Order Baru (Barang Keluar)" onClose={onClose} onSubmit={onSubmit} saving={saving} error={error} maxWidth="900px">
      <div style={{ background: "#eff6ff", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bfdbfe", color: "#1e3a8a", fontSize: "14px", marginBottom: "20px" }}>
        💡 <strong>Perhatian:</strong> Menyimpan form ini akan langsung memotong stok fisik Gudang Anda secara permanen.
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h4 style={{ margin: 0 }}>Daftar Pengeluaran Barang</h4>
        <button type="button" onClick={addItem} style={{ padding: "6px 12px", background: "#e0e7ff", color: "#4f46e5", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}>
          + Tambah Baris Barang
        </button>
      </div>

      {form.items.length === 0 ? (
        <p style={{ textAlign: "center", color: "gray", padding: "24px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>Keranjang kosong. Klik tambah baris barang.</p>
      ) : (
        form.items.map((item, idx) => {
          const selectedBarang = barangList.find(b => b.kodeBarang === item.kodeBarang);
          
          // Hitung maks stok berdasarkan konversi yang dipilih
          const multiplierToBase = selectedBarang ? getMultiplier(item.kodeBarang, item.eum, selectedBarang.baseEum) : 1;
          const maxStokTampil = selectedBarang ? Math.floor(selectedBarang.barangSiap / multiplierToBase) : 999999;
          const isOverStock = item.qty > maxStokTampil;

          // Cari opsi satuan (Dus, Kantong, Pcs) yang tersedia untuk dropdown
          const availableEums = selectedBarang ? Array.from(new Set([
             selectedBarang.baseEum,
             ...transformList.filter(t => t.kodeBarang === item.kodeBarang).map(t => t.eumFrom),
             ...transformList.filter(t => t.kodeBarang === item.kodeBarang).map(t => t.eumTo)
          ])) : [];

          return (
            <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "12px", background: isOverStock ? "#fef2f2" : "#f8fafc", padding: "16px", borderRadius: "8px", border: `1px solid ${isOverStock ? "#fecaca" : "#e2e8f0"}` }}>
              
              <div style={{ flex: 2 }}>
                <label className={styles.label}>Pilih Barang</label>
                <select className={styles.input} value={item.kodeBarang} onChange={(e) => handleItemChange(idx, e.target.value)}>
                  <option value="">-- Pilih Barang --</option>
                  {barangList.map(b => <option key={b.kodeBarang} value={b.kodeBarang}>{b.kodeBarang} - {b.namaBarang} (Tersedia: {b.barangSiap} {b.baseEum})</option>)}
                </select>
              </div>

              {item.kodeBarang && (
                <>
                  <div style={{ width: "110px" }}>
                    <label className={styles.label}>Satuan</label>
                    <select className={styles.input} value={item.eum} onChange={(e) => handleEumChange(idx, e.target.value)}>
                      {availableEums.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  <div style={{ width: "90px" }}>
                    <label className={styles.label} style={{ color: isOverStock ? "red" : "inherit" }}>Qty Keluar</label>
                    <input type="number" min="1" max={maxStokTampil} className={styles.input} style={{ borderColor: isOverStock ? "red" : "#cbd5e1" }} value={item.qty} onChange={(e) => handleQtyChange(idx, Number(e.target.value))} />
                  </div>
                  
                  <div style={{ width: "160px" }}>
                    <label className={styles.label}>Subtotal Harga</label>
                    <div style={{ padding: "8px 12px", background: "#e2e8f0", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", color: "#1e293b", height: "38px", display: "flex", alignItems: "center" }}>
                      Rp {item.totalHarga.toLocaleString('id-ID')}
                    </div>
                  </div>
                </>
              )}
              
              <button type="button" onClick={() => removeItem(idx)} style={{ padding: "0", width: "38px", height: "38px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>✕</button>
            </div>
          );
        })
      )}
      
      {form.items.length > 0 && (
         <div style={{ textAlign: "right", marginTop: "24px", fontSize: "18px", padding: "16px", background: "#f1f5f9", borderRadius: "8px", color: "#0f172a" }}>
           <strong>Estimasi Nilai Transaksi: Rp {form.items.reduce((sum, i) => sum + i.totalHarga, 0).toLocaleString('id-ID')}</strong>
         </div>
      )}
    </Form>
  );
}