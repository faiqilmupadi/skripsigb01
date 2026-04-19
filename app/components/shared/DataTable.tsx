"use client";

import { useMemo, useState } from "react";

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

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .dt-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #e8edf5;
    box-shadow: 0 4px 24px -4px rgba(16, 24, 48, 0.08), 0 0 0 1px rgba(255,255,255,0.8) inset;
    overflow: hidden;
    width: 100%;
  }

  .dt-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    gap: 16px;
    flex-wrap: wrap;
    border-bottom: 1px solid #f0f4fa;
    background: linear-gradient(180deg, #fafbff 0%, #ffffff 100%);
  }

  .dt-title-block {}
  .dt-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.3px;
  }
  .dt-subtitle {
    margin: 3px 0 0;
    font-size: 12.5px;
    color: #94a3b8;
    font-weight: 500;
  }

  .dt-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .dt-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .dt-search-icon {
    position: absolute;
    left: 12px;
    color: #94a3b8;
    pointer-events: none;
    font-size: 14px;
    display: flex;
    align-items: center;
  }
  .dt-search-input {
    padding: 8px 12px 8px 34px;
    font-size: 13px;
    font-family: inherit;
    font-weight: 500;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
    color: #0f172a;
    outline: none;
    width: 220px;
    transition: all 0.18s ease;
  }
  .dt-search-input::placeholder { color: #b0bac8; }
  .dt-search-input:focus {
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    width: 260px;
  }

  .dt-select {
    padding: 8px 32px 8px 12px;
    font-size: 12.5px;
    font-family: inherit;
    font-weight: 600;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E") no-repeat right 12px center;
    color: #475569;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: all 0.18s;
  }
  .dt-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    background-color: #fff;
  }

  .dt-table-wrap {
    overflow-x: auto;
    width: 100%;
  }

  .dt-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13.5px;
  }

  .dt-thead {}
  .dt-thead tr {
    background: #f8fafc;
  }
  .dt-thead th {
    padding: 11px 16px;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #7c8fa6;
    border-bottom: 1.5px solid #edf0f7;
    white-space: nowrap;
    position: sticky;
    top: 0;
    background: #f8fafc;
    z-index: 1;
  }
  .dt-thead th:first-child { padding-left: 24px; }
  .dt-thead th:last-child { padding-right: 24px; }

  .dt-tbody tr {
    transition: background 0.12s ease;
    border-bottom: 1px solid #f4f6fb;
  }
  .dt-tbody tr:last-child { border-bottom: none; }
  .dt-tbody tr:hover { background: #fafbff; }

  .dt-tbody td {
    padding: 13px 16px;
    color: #374151;
    font-weight: 500;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5fb;
  }
  .dt-tbody tr:last-child td { border-bottom: none; }
  .dt-tbody td:first-child { padding-left: 24px; }
  .dt-tbody td:last-child { padding-right: 24px; }

  .dt-empty {
    text-align: center;
    padding: 56px 24px !important;
    color: #b0bac8;
    font-size: 14px;
    font-weight: 500;
  }
  .dt-empty-icon {
    display: block;
    font-size: 32px;
    margin-bottom: 10px;
  }

  .dt-loading-row td {
    padding: 48px 24px !important;
    text-align: center;
  }
  .dt-skeleton-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f4fa 25%, #e8edf5 50%, #f0f4fa 75%);
    background-size: 200% 100%;
    animation: dt-shimmer 1.4s infinite;
    margin: 0 auto;
  }
  @keyframes dt-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .dt-actions-cell {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  .dt-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: #fafbff;
    border-top: 1.5px solid #edf0f7;
    flex-wrap: wrap;
    gap: 10px;
  }

  .dt-count {
    font-size: 12.5px;
    font-weight: 600;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dt-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    height: 22px;
    padding: 0 8px;
    background: #6366f1;
    color: #fff;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
  }

  .dt-pagination {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dt-page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 10px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    color: #475569;
    font-size: 12.5px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
    gap: 4px;
  }
  .dt-page-btn:hover:not(:disabled) {
    background: #6366f1;
    color: #fff;
    border-color: #6366f1;
  }
  .dt-page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .dt-page-info {
    padding: 0 12px;
    font-size: 12.5px;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
  }
  .dt-page-info b { color: #0f172a; }
`;

function StyleInjector() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
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

  if (page > totalPages) setPage(totalPages);

  const colSpan = columns.length + (renderActions ? 1 : 0);

  return (
    <>
      <StyleInjector />
      <div className="dt-root">
        {/* Toolbar */}
        <div className="dt-toolbar">
          <div className="dt-title-block">
            {title && <h3 className="dt-title">{title}</h3>}
            {subtitle && <p className="dt-subtitle">{subtitle}</p>}
          </div>

          <div className="dt-controls">
            {search && (
              <div className="dt-search-wrap">
                <span className="dt-search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input
                  className="dt-search-input"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder={search.placeholder ?? "Search…"}
                />
              </div>
            )}

            <select
              className="dt-select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>Tampil {n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="dt-table-wrap">
          <table className="dt-table">
            <thead className="dt-thead">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} style={{ width: c.width, textAlign: c.align ?? "left" }}>
                    {c.header}
                  </th>
                ))}
                {renderActions && (
                  <th style={{ textAlign: "right", width: 140 }}>{actionsHeader}</th>
                )}
              </tr>
            </thead>

            <tbody className="dt-tbody">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="dt-loading-row">
                    {Array.from({ length: colSpan }).map((_, j) => (
                      <td key={j}>
                        <div className="dt-skeleton-line" style={{ width: `${60 + Math.random() * 30}%`, opacity: 1 - i * 0.15 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length ? (
                pageRows.map((r) => (
                  <tr key={rowKey(r)}>
                    {columns.map((c) => {
                      const content = c.render?.(r) ?? (c.accessor ? (r as any)[c.accessor] : "");
                      return (
                        <td key={c.key} className={c.className} style={{ textAlign: c.align ?? "left" }}>
                          {content as any}
                        </td>
                      );
                    })}
                    {renderActions && (
                      <td>
                        <div className="dt-actions-cell">{renderActions(r)}</div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={colSpan} className="dt-empty">
                    <span className="dt-empty-icon">📭</span>
                    {query ? "Tidak ada data yang cocok dengan pencarian." : "Data kosong"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="dt-footer">
          <div className="dt-count">
            Total
            <span className="dt-count-badge">{filtered.length}</span>
            data{query && ` (difilter dari ${rows.length})`}
          </div>

          <div className="dt-pagination">
            <button
              className="dt-page-btn"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              type="button"
              title="Halaman pertama"
            >
              «
            </button>
            <button
              className="dt-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              ‹ Prev
            </button>

            <span className="dt-page-info">
              Hal <b>{page}</b> / <b>{totalPages}</b>
            </span>

            <button
              className="dt-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              type="button"
            >
              Next ›
            </button>
            <button
              className="dt-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              type="button"
              title="Halaman terakhir"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </>
  );
}