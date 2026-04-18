"use client";

import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import DataTable, { DataTableColumn } from "@/app/components/shared/DataTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter"; // <-- Import Filter
import PurchaseOrderForm from "./PurchaseOrderForm";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import styles from "@/styles/manajemenAkun.module.css";
import { PurchaseOrderGroup } from "../types";

export default function PurchaseOrderPage() {
  const po = usePurchaseOrder();

  const columns: DataTableColumn<PurchaseOrderGroup>[] = [
    { key: "nomorPurchaseOrder", header: "Nomor PO", accessor: "nomorPurchaseOrder", width: 150 },
    { key: "tanggal", header: "Tanggal", accessor: "tanggal", width: 120 },
    { key: "vendor", header: "Vendor", accessor: "namaVendor" },
    { key: "pic", header: "PIC (Admin)", accessor: "penanggungJawab", width: 130 },
    { 
      key: "status", 
      header: "Status", 
      accessor: "status",
      render: (rowOrVal: any) => {
        const statusVal = typeof rowOrVal === "object" && rowOrVal !== null ? rowOrVal.status : rowOrVal;
        let bg = "#f1f5f9", text = "#475569";
        if (statusVal === "Sudah Dipesan") { bg = "#e0f2fe"; text = "#0369a1"; } 
        else if (statusVal === "Sedang Dikemas") { bg = "#fef08a"; text = "#854d0e"; } 
        else if (statusVal === "Sedang Dalam Pengiriman") { bg = "#ffedd5"; text = "#c2410c"; } 
        else if (statusVal === "Selesai") { bg = "#dcfce7"; text = "#166534"; } 
        
        return <span style={{ background: bg, color: text, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>{statusVal}</span>;
      }
    },
    { 
      key: "total", header: "Total Tagihan", accessor: "totalSemuaHarga", 
      render: (rowOrVal: any) => `Rp ${Number(rowOrVal.totalSemuaHarga || rowOrVal).toLocaleString("id-ID")}`
    },
  ];

  const handlePrintPDF = (order: PurchaseOrderGroup) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>PURCHASE ORDER</h2>
        <p><strong>Nomor PO:</strong> ${order.nomorPurchaseOrder}</p>
        <p><strong>Tanggal:</strong> ${order.tanggal}</p>
        <p><strong>Vendor:</strong> ${order.namaVendor} (${order.kodeVendor})</p>
        <hr/>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f3f4f6; text-align: left;">
              <th style="padding: 8px; border: 1px solid #ccc;">Barang</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Qty Pesan</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Estimasi Pcs</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(i => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ccc;">${i.kodeBarang} - ${i.namaBarang}</td>
                <td style="padding: 8px; border: 1px solid #ccc;">${i.qty} ${i.eum}</td>
                <td style="padding: 8px; border: 1px solid #ccc;">${i.baseQty} ${i.baseEum}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <h3 style="text-align: right; margin-top: 20px;">Grand Total: Rp ${Number(order.totalSemuaHarga).toLocaleString('id-ID')}</h3>
        ${order.status === "Selesai" ? `<br/><p><strong>Catatan Penerimaan:</strong> ${order.catatan || "-"}</p>` : ''}
      </div>
    `;
    const win = window.open('', '_blank');
    if (win) { win.document.write(printContent); win.document.close(); win.focus(); win.print(); }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Purchase Order</h2>
          <p style={{ margin: "4px 0", fontSize: 13, color: "gray" }}>Kelola pemesanan dan konversi penerimaan barang dari Vendor</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => po.setFormOpen(true)}>+ Buat PO Baru</button>
      </div>

      {/* --- KOMPONEN FILTER WAKTU --- */}
      <div style={{ marginBottom: "20px" }}>
        <TimeRangeFilter 
          preset={po.timePreset} 
          setPreset={po.setTimePreset}
          customStart={po.customStart}
          setCustomStart={po.setCustomStart}
          customEnd={po.customEnd}
          setCustomEnd={po.setCustomEnd}
        />
      </div>

      <DataTable<PurchaseOrderGroup>
        title="Riwayat Pesanan"
        rows={po.rows} // <-- Ini sudah terfilter otomatis dari hook
        columns={columns}
        rowKey={(r) => r.nomorPurchaseOrder}
        loading={po.loading}
        search={{ placeholder: "Cari nomor PO atau Vendor...", keys: ["nomorPurchaseOrder", "namaVendor"] }}
        actionsHeader="Aksi"
        renderActions={(row) => {
          const isReceivable = row.status === "Sedang Dalam Pengiriman";
          return (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button 
                className={styles.btnGhost} 
                onClick={() => po.openReceiveModal(row)} 
                title="Terima Barang"
                disabled={!isReceivable}
                style={{ color: isReceivable ? "#15803d" : "#94a3b8", cursor: isReceivable ? "pointer" : "not-allowed", opacity: isReceivable ? 1 : 0.5, background: isReceivable ? "#dcfce7" : "transparent" }}
              >
                📥 Terima
              </button>
              <button className={styles.btnGhost} onClick={() => po.setViewTarget(row)}>👁️ Detail</button>
            </div>
          );
        }}
      />

      <PurchaseOrderForm
        open={po.formOpen} saving={po.saving} error={po.error} form={po.form} vendors={po.vendors} vendorLists={po.vendorLists}
        onClose={() => po.setFormOpen(false)} onSubmit={po.handleSave} setForm={po.setForm} handleVendorChange={po.handleVendorChange} 
        handleItemChange={po.handleItemChange} handleQtyChange={po.handleQtyChange} addItem={po.addItem} removeItem={po.removeItem}
      />

      <PurchaseOrderDetail data={po.viewTarget} onClose={() => po.setViewTarget(null)} />

      {/* MODAL TERIMA BARANG (Dalam Satuan Terkecil / Pcs) */}
      {po.receiveTarget && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "700px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 8px 0" }}>Terima Barang: {po.receiveTarget.nomorPurchaseOrder}</h3>
            <p style={{ margin: "0 0 16px 0", color: "gray", fontSize: "14px" }}>
              Sistem telah melakukan perhitungan <b>konversi otomatis</b>. Silakan hitung fisik barang dalam <b>satuan terkecil</b>.
            </p>
            
            <div style={{ background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead style={{ background: "#f1f5f9", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    <th style={{ padding: "10px", fontWeight: 600 }}>Barang</th>
                    <th style={{ padding: "10px", fontWeight: 600 }}>Dipesan</th>
                    <th style={{ padding: "10px", fontWeight: 600 }}>Ekspektasi Konversi</th>
                    <th style={{ padding: "10px", fontWeight: 600, width: "140px" }}>Fisik Aktual</th>
                  </tr>
                </thead>
                <tbody>
                  {po.receiveItems.map((item, idx) => {
                    const isOver = item.qtyDiterima > item.qtyPesanBase;
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0", background: isOver ? "#fef2f2" : "transparent" }}>
                        <td style={{ padding: "10px" }}>{item.kodeBarang} - {item.namaBarang}</td>
                        <td style={{ padding: "10px" }}>{item.qtyPesanAsli} {item.eumAsli}</td>
                        <td style={{ padding: "10px", fontWeight: "bold", color: "#0369a1" }}>
                           {item.qtyPesanBase.toLocaleString('id-ID')} {item.eum}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input 
                              type="number" 
                              min="0"
                              className={styles.input} 
                              style={{ 
                                padding: "6px", width: "80px", textAlign: "center",
                                borderColor: isOver ? "#ef4444" : "#cbd5e1",
                                color: isOver ? "#b91c1c" : "inherit",
                                fontWeight: "bold"
                              }}
                              value={item.qtyDiterima} 
                              onChange={(e) => po.handleReceiveQtyChange(idx, Number(e.target.value))} 
                            />
                            <span style={{ fontSize: "12px", color: "gray", fontWeight: "bold" }}>{item.eum}</span>
                          </div>
                          {isOver && (
                            <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "bold" }}>
                              ⚠️ Kelebihan (+{item.qtyDiterima - item.qtyPesanBase})
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Catatan / Berita Acara (Wajib jika ada selisih)</label>
              <textarea 
                className={styles.input} 
                rows={3}
                placeholder="Contoh: Datang 950 Pcs (Terdapat 50 Pcs cacat produksi / botol pecah)."
                value={po.receiveCatatan}
                onChange={(e) => po.setReceiveCatatan(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            {po.isOverReceiving && (
              <div style={{ marginTop: "16px", padding: "12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", color: "#b45309", fontSize: "13px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "16px" }}>⚠️</span>
                <span><strong>Peringatan Surat Jalan:</strong> Anda memasukkan fisik aktual yang <b>melebihi</b> ekspektasi konversi pesanan awal. Pastikan fisik dan surat jalan dari Vendor benar-benar valid.</span>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => po.setReceiveTarget(null)} className={styles.btnGhost}>Batal</button>
              <button 
                type="button" 
                onClick={po.handleReceivePO} 
                disabled={po.isReceiving}
                style={{ padding: "8px 16px", background: "#16a34a", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: po.isReceiving ? "not-allowed" : "pointer" }}
              >
                {po.isReceiving ? "Menyimpan ke Stok..." : "Selesaikan Penerimaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}