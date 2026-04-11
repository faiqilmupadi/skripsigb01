"use client";

import styles from "@/styles/dashboardAnalisis.module.css";

type AdminKinerjaPoint = {
  date: string;
  [adminName: string]: string | number;
};

type Props = {
  start: string;
  end: string;
  topAdmins: string[];
  series: AdminKinerjaPoint[];
};

type Row = {
  name: string;
  pct: number;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function pickBarColor(index: number) {
  // mirip screenshot: biru, oranye, pink, hijau, ungu, merah
  const palette = ["#2563eb", "#f59e0b", "#ec4899", "#10b981", "#8b5cf6", "#ef4444"];
  return palette[index % palette.length];
}

export default function KinerjaAdmin({ start, end, topAdmins, series }: Props) {
  const bucket = series?.[0] ?? { date: `${start} → ${end}` };

  const rows: Row[] = topAdmins
    .map((name) => ({
      name,
      pct: Number(bucket[name] ?? 0),
    }))
    .filter((r) => Number.isFinite(r.pct));

  return (
    <section className={styles.cardLarge}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>Kinerja Admin</div>
          <div className={styles.cardSub}>
            Persentase kontribusi barang keluar (261) berdasarkan kuantitas pada periode {start} s.d. {end}
          </div>
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.metaPill}>
            {start} → {end}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={styles.emptyState}>
          Belum ada data barang keluar (261) pada periode ini.
        </div>
      ) : (
        <>
          <div className={styles.kinerjaChartCard}>
            <div className={styles.kinerjaPlotShell}>
              {/* Y Axis */}
              <div className={styles.kinerjaYAxis}>
                <div className={styles.kinerjaYAxisTop}>100%</div>
                <div>75%</div>
                <div>50%</div>
                <div>25%</div>
                <div className={styles.kinerjaYAxisBottom}>0%</div>
              </div>

              {/* Plot */}
              <div className={styles.kinerjaPlotArea}>
                {[25, 50, 75, 100].map((v) => (
                  <div
                    key={v}
                    className={styles.kinerjaGridLine}
                    style={{ bottom: `${v}%` }}
                  />
                ))}

                <div
                  className={styles.kinerjaBarsGrid}
                  style={{
                    gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
                  }}
                >
                  {rows.map((row, idx) => {
                    const h = clamp(row.pct);
                    const barColor = pickBarColor(idx);

                    return (
                      <div key={row.name} className={styles.kinerjaBarCol}>
                        <div className={styles.kinerjaBarWrap}>
                          <div
                            className={styles.kinerjaBar}
                            title={`${row.name}: ${row.pct.toFixed(2)}%`}
                            style={{
                              height: `${h}%`,
                              background: barColor,
                            }}
                          />
                        </div>

                        <div
                          className={styles.kinerjaXAxisLabel}
                          title={row.name}
                        >
                          {row.name}
                        </div>

                        <div className={styles.kinerjaPctLabel}>
                          {row.pct.toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className={styles.kinerjaLegendRow}>
            {rows.map((row, idx) => (
              <div
                key={`${row.name}-legend`}
                className={styles.kinerjaLegendItem}
                title={`${row.name}: ${row.pct.toFixed(2)}%`}
              >
                <span
                  className={styles.kinerjaLegendSwatch}
                  style={{ background: pickBarColor(idx) }}
                />
                <span className={styles.kinerjaLegendText}>
                  {row.name} ({row.pct.toFixed(2)}%)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}