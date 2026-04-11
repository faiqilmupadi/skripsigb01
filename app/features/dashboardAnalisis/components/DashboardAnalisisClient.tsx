"use client";

import styles from "@/styles/dashboardAnalisis.module.css";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";
import { useTimeRange } from "@/app/hooks/useTimeRange";
import { useDashboardAnalisis } from "../hooks/useDashboardAnalisis";

import TransaksiBarang from "./TransaksiBarang";
import KinerjaAdmin from "./KinerjaAdminSection";

export default function DashboardAnalisisClient() {
  const time = useTimeRange("7d");
  const { data, loading } = useDashboardAnalisis(time.query);

  const showError = Boolean(data && !data.ok);
  const showOk = Boolean(data && data.ok);

  return (
    <>
      <div className={styles.topBar}>
        <TimeRangeFilter
          preset={time.preset}
          setPreset={time.setPreset}
          customStart={time.customStart}
          setCustomStart={time.setCustomStart}
          customEnd={time.customEnd}
          setCustomEnd={time.setCustomEnd}
        />
      </div>

      {loading ? <div className={styles.loading}>Loading dashboard...</div> : null}

      {showError ? (
        <div className={styles.errorBox}>{(data as any).message ?? "Terjadi error."}</div>
      ) : null}

      {showOk ? (
        <>
          <TransaksiBarang
            start={(data as any).start}
            end={(data as any).end}
            summary={(data as any).summary}
          />

          <KinerjaAdmin
            start={(data as any).start}
            end={(data as any).end}
            series={(data as any).kinerja.series}
            topAdmins={(data as any).kinerja.topAdmins}
          />
        </>
      ) : null}
    </>
  );
}