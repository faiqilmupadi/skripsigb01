import { dbQuery } from "@/app/lib/db.server";

type KinerjaUserOutRow = {
  userName: string;
  kontribusiKeluar: number;
};

type TotalOutQtyRow = {
  totalBarangKeluarQty: number;
};

type SummaryTxnRow = {
  totalTransaksi: number;
  totalBarangKeluar: number;
  totalBarangMasuk: number;
  totalBarangRetur: number;
};

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(d: Date, days: number) {
  return new Date(d.getTime() + days * 86400000);
}

function parseRange(sp: URLSearchParams) {
  const preset = (sp.get("preset") ?? "7d").toLowerCase();
  const today = new Date();

  if (preset === "custom") {
    const start = sp.get("start");
    const end = sp.get("end");
    if (!start || !end) throw new Error("Custom range tapi start/end kosong");
    return { start, end, preset };
  }

  if (preset === "24h") return { start: toYmd(addDays(today, -1)), end: toYmd(today), preset };
  if (preset === "1m") return { start: toYmd(addDays(today, -30)), end: toYmd(today), preset };
  if (preset === "3m") return { start: toYmd(addDays(today, -90)), end: toYmd(today), preset };

  return { start: toYmd(addDays(today, -7)), end: toYmd(today), preset };
}

export type DashboardAnalisisOk = {
  ok: true;
  start: string;
  end: string;
  summary: {
    totalTransaksi: number;   // count trx 261+101+Z48
    totalBarangKeluar: number; // count trx 261
    totalBarangMasuk: number;  // count trx 101
    totalBarangRetur: number;  // count trx Z48
  };
  kinerja: {
    topAdmins: string[];
    series: Array<Record<string, string | number>>;
  };
};

export async function getDashboardAnalisis(sp: URLSearchParams): Promise<DashboardAnalisisOk> {
  const { start, end } = parseRange(sp);

  // ============================================================
  // A) Summary cards (JUMLAH TRANSAKSI / COUNT)
  // ============================================================
  const summaryRows = await dbQuery<SummaryTxnRow>(
    `
    SELECT
      SUM(CASE WHEN (movementType = 261 OR movementType = '261') THEN 1 ELSE 0 END) AS totalBarangKeluar,
      SUM(CASE WHEN (movementType = 101 OR movementType = '101') THEN 1 ELSE 0 END) AS totalBarangMasuk,
      SUM(CASE WHEN (movementType = 'Z48' OR movementType = 'z48') THEN 1 ELSE 0 END) AS totalBarangRetur,
      SUM(
        CASE
          WHEN (movementType = 261 OR movementType = '261')
            OR (movementType = 101 OR movementType = '101')
            OR (movementType = 'Z48' OR movementType = 'z48')
          THEN 1 ELSE 0
        END
      ) AS totalTransaksi
    FROM material_movement
    WHERE postingDate BETWEEN ? AND ?
    `,
    [start, end]
  );

  const summary = {
    totalTransaksi: Number(summaryRows?.[0]?.totalTransaksi ?? 0),
    totalBarangKeluar: Number(summaryRows?.[0]?.totalBarangKeluar ?? 0),
    totalBarangMasuk: Number(summaryRows?.[0]?.totalBarangMasuk ?? 0),
    totalBarangRetur: Number(summaryRows?.[0]?.totalBarangRetur ?? 0),
  };

  const totalOutRows = await dbQuery<TotalOutQtyRow>(
    `
    SELECT
      SUM(
        CASE
          WHEN (movementType = 261 OR movementType = '261') AND quantity < 0 THEN ABS(quantity)
          ELSE 0
        END
      ) AS totalBarangKeluarQty
    FROM material_movement
    WHERE postingDate BETWEEN ? AND ?
    `,
    [start, end]
  );

  const totalBarangKeluarQty = Number(totalOutRows?.[0]?.totalBarangKeluarQty ?? 0);

  const userOutRows = await dbQuery<KinerjaUserOutRow>(
    `
    SELECT
      userName,
      SUM(
        CASE
          WHEN (movementType = 261 OR movementType = '261') AND quantity < 0 THEN ABS(quantity)
          ELSE 0
        END
      ) AS kontribusiKeluar
    FROM material_movement
    WHERE postingDate BETWEEN ? AND ?
      AND userName IS NOT NULL
      AND userName <> ''
    GROUP BY userName
    `,
    [start, end]
  );

  const userPct = userOutRows
    .map((r) => {
      const kontribusiKeluar = Number(r.kontribusiKeluar ?? 0);
      const pct = totalBarangKeluarQty > 0 ? (kontribusiKeluar / totalBarangKeluarQty) * 100 : 0;
      return { name: r.userName, pct, kontribusiKeluar };
    })
    .filter((x) => x.kontribusiKeluar > 0)
    .sort((a, b) => b.pct - a.pct);

  const topAdmins = userPct.map((x) => x.name);

  const bucketLabel = `${start} → ${end}`;
  const oneBucket: Record<string, string | number> = { date: bucketLabel };

  for (const u of userPct) {
    oneBucket[u.name] = Number(u.pct.toFixed(2));
  }

  const series = [oneBucket];

  return {
    ok: true,
    start,
    end,
    summary,
    kinerja: { topAdmins, series },
  };
}