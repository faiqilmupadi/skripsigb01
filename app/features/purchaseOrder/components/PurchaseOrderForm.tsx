"use client";

import Form from "@/app/components/shared/Form";
import { PurchaseOrderFormData, VendorOption, VendorListOption } from "../types";
import styles from "@/styles/manajemenAkun.module.css";

type Props = {
  open: boolean; saving: boolean; error: string | null; form: PurchaseOrderFormData; vendors: VendorOption[]; vendorLists: VendorListOption[];
  onClose: () => void; onSubmit: () => Promise<void>; setForm: React.Dispatch<React.SetStateAction<PurchaseOrderFormData>>;
  handleVendorChange: (kodeVendor: string) => void; handleItemChange: (index: number, kodeBarang: string) => void; handleQtyChange: (index: number, qty: number) => void;
  addItem: () => void; removeItem: (index: number) => void;
};

export default function PurchaseOrderForm({
  open, saving, error, form, vendors, vendorLists, onClose, onSubmit, setForm, handleVendorChange, handleItemChange, handleQtyChange, addItem, removeItem
}: Props) {
  
  const availableBarang = vendorLists.filter(v => v.kodeVendor === form.kodeVendor);

  return (
    <Form open={open} title="Buat Purchase Order Baru" onClose={onClose} onSubmit={onSubmit} saving={saving} error={error} maxWidth="900px">
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", gridColumn: "1 / -1" }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Pilih Vendor</label>
          <select className={styles.input} value={form.kodeVendor} onChange={(e) => handleVendorChange(e.target.value)}>
            <option value="">-- Pilih Vendor --</option>
            {vendors.map(v => (
              <option key={v.kodeVendor} value={v.kodeVendor}>{v.kodeVendor} - {v.namaVendor}</option>
            ))}
          </select>
        </div>
      </div>

      {form.kodeVendor && (
        <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h4 style={{ margin: 0 }}>Daftar Pesanan (Wajib dalam satuan Vendor)</h4>
            <button type="button" onClick={addItem} style={{ padding: "6px 12px", background: "#e0e7ff", color: "#4f46e5", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}>
              + Tambah Barang
            </button>
          </div>

          {form.items.length === 0 ? (
            <p style={{ textAlign: "center", color: "gray", padding: "24px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>Belum ada barang di keranjang.</p>
          ) : (
            form.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "12px", background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                
                <div style={{ flex: 2 }}>
                  <label className={styles.label}>Pilih Barang</label>
                  <select className={styles.input} value={item.kodeBarang} onChange={(e) => handleItemChange(idx, e.target.value)}>
                    <option value="">-- Pilih Barang --</option>
                    {availableBarang.map(b => (
                      <option key={b.kodeBarang} value={b.kodeBarang}>{b.kodeBarang} - {b.namaBarang} (Satuan: {b.eum})</option>
                    ))}
                  </select>
                </div>

                {item.kodeBarang && (
                  <>
                    <div style={{ width: "100px" }}>
                      <label className={styles.label}>Qty ({item.eum})</label>
                      <input type="number" min="1" className={styles.input} value={item.qty} onChange={(e) => handleQtyChange(idx, Number(e.target.value))} />
                    </div>

                    {/* BOX BARU: Menampilkan Konversi Otomatis */}
                    <div style={{ width: "140px" }}>
                      <label className={styles.label}>Estimasi Konversi</label>
                      <div style={{ padding: "8px 12px", background: "#eff6ff", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", color: "#0369a1", height: "38px", display: "flex", alignItems: "center", border: "1px solid #bae6fd" }}>
                        = {item.baseQty ? item.baseQty.toLocaleString('id-ID') : 0} {item.baseEum}
                      </div>
                    </div>

                    <div style={{ width: "150px" }}>
                      <label className={styles.label}>Subtotal Harga</label>
                      <div style={{ padding: "8px 12px", background: "#e2e8f0", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", color: "#1e293b", height: "38px", display: "flex", alignItems: "center" }}>
                        Rp {item.totalHarga.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </>
                )}

                <button type="button" onClick={() => removeItem(idx)} style={{ padding: "0", width: "38px", height: "38px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>✕</button>
              </div>
            ))
          )}
          
          {form.items.length > 0 && (
             <div style={{ textAlign: "right", marginTop: "24px", fontSize: "18px", padding: "16px", background: "#f1f5f9", borderRadius: "8px" }}>
               <strong>Grand Total: Rp {form.items.reduce((sum, i) => sum + i.totalHarga, 0).toLocaleString('id-ID')}</strong>
             </div>
          )}
        </div>
      )}
    </Form>
  );
}