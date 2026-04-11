// app/components/shared/DataTable.tsx
"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/dataTable.module.css";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  width?: number | string;
  align?: "left" | "right" | "center";
  className?: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
};

type SearchConfig<T> = {
  placeholder?: string;
  keys: (keyof T)[];
};

type Props<T> = {
  title?: string;
  subtitle?: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;

  loading?: boolean;

  search?: SearchConfig<T>;
  initialPageSize?: number;
  pageSizeOptions?: number[];

  // optional actions column
  actionsHeader?: string;
  renderActions?: (row: T) => React.ReactNode;
};

function stringifyValue(v: unknown) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

export default function DataTable<T>({
  title,
  subtitle,
  rows,
  columns,
  rowKey,
  loading = false,
  search,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  actionsHeader = "Aksi",
  renderActions,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search || !query.trim()) return rows;
    const q = query.trim().toLowerCase();

    return rows.filter((r) =>
      search.keys.some((k) => stringifyValue((r as any)[k]).toLowerCase().includes(q))
    );
  }, [rows, search, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageRows = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  // clamp when data changes
  if (page > totalPages) setPage(totalPages);

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.titleBlock}>
          {title ? <h3 className={styles.title}>{title}</h3> : null}
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>

        <div className={styles.controls}>
          {search ? (
            <div className={styles.searchWrap}>
              <input
                className={styles.searchInput}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={search.placeholder ?? "Search…"}
              />
            </div>
          ) : null}

          <select
            className={styles.select}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                Show {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    width: c.width,
                    textAlign: c.align ?? "left",
                  }}
                >
                  {c.header}
                </th>
              ))}
              {renderActions ? (
                <th style={{ textAlign: "right", width: 120 }}>{actionsHeader}</th>
              ) : null}
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className={styles.empty}>
                  Memuat…
                </td>
              </tr>
            ) : pageRows.length ? (
              pageRows.map((r) => (
                <tr key={rowKey(r)}>
                  {columns.map((c) => {
                    const content =
                      c.render?.(r) ??
                      (c.accessor ? (r as any)[c.accessor] : "");

                    return (
                      <td
                        key={c.key}
                        className={c.className}
                        style={{ textAlign: c.align ?? "left" }}
                      >
                        {content as any}
                      </td>
                    );
                  })}

                  {renderActions ? (
                    <td>
                      <div className={styles.actions}>{renderActions(r)}</div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className={styles.empty}>
                  Data kosong
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <div className={styles.pageInfo}>
          Total: <b>{filtered.length}</b>
        </div>

        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            type="button"
          >
            Prev
          </button>

          <span className={styles.pageInfo}>
            Page <b>{page}</b> / {totalPages}
          </span>

          <button
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
