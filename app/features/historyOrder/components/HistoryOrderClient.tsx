"use client";

import styles from "@/styles/manajemenAkun.module.css";
import OrderTable from "@/app/features/historyOrder/components/OrderTable";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import { useTimeRange } from "@/app/hooks/useTimeRange";
import { useHistoryOrder } from "@/app/features/historyOrder/hooks/useHistoryOrder";

export default function HistoryOrderClient() {
  const time = useTimeRange("7d");

  // ✅ list/table tetap pakai query string dari hook
  const { rows, loading, error, refresh } = useHistoryOrder(time.query);

  function handleExport() {
    const qs = new URLSearchParams();

    // ✅ export pakai range (from/to) agar sesuai filter yang dipilih
    if (time.range?.from) qs.set("from", time.range.from);
    if (time.range?.to) qs.set("to", time.range.to);

    window.open(`/api/kepalaGudang/historyOrder/export?${qs.toString()}`, "_blank");
  }

  const exportDisabled = loading || rows.length === 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>History Order</h1>
          <p className={styles.subtitle}>
            Total data: {rows.length}
            {time.range?.from && time.range?.to ? ` | Range: ${time.range.from} s/d ${time.range.to}` : ""}
          </p>
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>

        <div className={styles.actions}>
          <TimeRangeFilter
            preset={time.preset}
            setPreset={time.setPreset}
            customStart={time.customStart}
            setCustomStart={time.setCustomStart}
            customEnd={time.customEnd}
            setCustomEnd={time.setCustomEnd}
          />

          <button className={styles.btnGhost} onClick={refresh} disabled={loading}>
            Refresh
          </button>

          <button
            className={styles.btnPrimary ?? styles.btnGhost}
            onClick={handleExport}
            disabled={exportDisabled}
            title={exportDisabled ? "Tidak ada data untuk di-export / masih loading" : "Export CSV"}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <OrderTable rows={rows} loading={loading} />
      </div>
    </div>
  );
}
