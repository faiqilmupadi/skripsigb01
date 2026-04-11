"use client";

import styles from "@/styles/dashboardAnalisis.module.css";

type Props = {
  start: string;
  end: string;
  summary: {
    totalTransaksi: number;
    totalBarangKeluar: number;
    totalBarangMasuk: number;
    totalBarangRetur: number;
  };
};

function formatNumber(n: number) {
  return new Intl.NumberFormat("id-ID").format(Number(n ?? 0));
}

export default function TransaksiBarang({ start, end, summary }: Props) {
  return (
    <section className={`${styles.gridTwo} ${styles.summaryGrid}`}>
      {/* Total Transaksi */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Total Transaksi</div>
            <div className={styles.cardSub}>261 + 101 + Z48</div>
          </div>
          <div className={styles.cardMeta}>
            <span className={styles.metaPill}>
              {start} s.d. {end}
            </span>
          </div>
        </div>

        <div className={styles.statValue}>
          {formatNumber(summary.totalTransaksi)}
        </div>
      </div>

      {/* Barang Keluar */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Barang Keluar</div>
            <div className={styles.cardSub}>Movement Type 261</div>
          </div>
          <div className={styles.cardMeta}>
            <span className={styles.metaPill}>261</span>
          </div>
        </div>

        <div className={styles.statValue}>
          {formatNumber(summary.totalBarangKeluar)}
        </div>
      </div>

      {/* Barang Masuk */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Barang Masuk</div>
            <div className={styles.cardSub}>Movement Type 101</div>
          </div>
          <div className={styles.cardMeta}>
            <span className={styles.metaPill}>101</span>
          </div>
        </div>

        <div className={styles.statValue}>
          {formatNumber(summary.totalBarangMasuk)}
        </div>
      </div>

      {/* Barang Retur */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Barang Retur</div>
            <div className={styles.cardSub}>Movement Type Z48</div>
          </div>
          <div className={styles.cardMeta}>
            <span className={styles.metaPill}>Z48</span>
          </div>
        </div>

        <div className={styles.statValue}>
          {formatNumber(summary.totalBarangRetur)}
        </div>
      </div>
    </section>
  );
}