"use client";

import styles from "@/styles/dashboardAnalisis.module.css";
import type { TimePreset } from "@/app/types/timeRangeTypes";

type Props = {
  preset: TimePreset;
  setPreset: (p: TimePreset) => void;
  customStart: string;
  setCustomStart: (v: string) => void;
  customEnd: string;
  setCustomEnd: (v: string) => void;
};

const pills: { key: TimePreset; label: string }[] = [
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
  { key: "1m", label: "1M" },
  { key: "3m", label: "3M" },
  { key: "custom", label: "CUSTOM" },
];

export default function TimeRangeFilter({
  preset,
  setPreset,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
}: Props) {
  return (
    <div className={styles.timeRow}>
      <div className={styles.pills}>
        {pills.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPreset(p.key)}
            className={preset === p.key ? styles.pillActive : styles.pill}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" ? (
        <div className={styles.customRange}>
          <div className={styles.customLabel}>From</div>
          <input className={styles.dateInput} type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          <div className={styles.customLabel}>To</div>
          <input className={styles.dateInput} type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
        </div>
      ) : null}
    </div>
  );
}
