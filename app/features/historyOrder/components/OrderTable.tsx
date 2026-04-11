"use client";

import DataTable from "@/app/components/shared/DataTable";
import type { HistoryOrderRow } from "@/app/features/historyOrder/types";

function formatQty(q: number) {
  if (Number.isInteger(q)) return String(q);
  const s = q.toFixed(3);
  return s.replace(/\.?0+$/, "");
}

export default function OrderTable({
  rows,
  loading,
}: {
  rows: HistoryOrderRow[];
  loading: boolean;
}) {
  return (
    <DataTable<HistoryOrderRow>
      title="Product Summary"
      subtitle="History Order Material"
      rows={rows}
      loading={loading}
      rowKey={(r) => String(r.movementId)}
      search={{
        placeholder: "Search nomor part, cabang, PO, order, user…",
        keys: ["partNumber", "plant", "materialDescription", "purchaseOrder", "orderNo", "userName"],
      }}
      columns={[
        { key: "partNumber", header: "Nomor Part", accessor: "partNumber" },
        { key: "plant", header: "Cabang", accessor: "plant" },
        { key: "materialDescription", header: "Material", accessor: "materialDescription" },
        { key: "purchaseOrder", header: "Nomer PO", render: (r) => r.purchaseOrder ?? "-" },
        { key: "orderNo", header: "Nomer Order", render: (r) => r.orderNo ?? "-" },
        { key: "movementType", header: "Jenis Transaksi", accessor: "movementType" },
        { key: "quantity", header: "Jumlah", align: "right", render: (r) => formatQty(r.quantity) },
        { key: "userName", header: "Nama", accessor: "userName" },
      ]}
    />
  );
}
