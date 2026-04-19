import React from "react";

type FormProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  saving?: boolean;
  submitText?: string;
  error?: string | null;
  children: React.ReactNode;
  maxWidth?: string;
  icon?: string;
};

const FORM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .fm-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10, 15, 30, 0.6);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fm-fade-in 0.18s ease;
  }

  @keyframes fm-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fm-slide-up {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }

  .fm-panel {
    background: #ffffff;
    border-radius: 24px;
    width: 100%;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.06),
      0 8px 16px -4px rgba(0,0,0,0.1),
      0 32px 64px -16px rgba(0,0,0,0.18);
    font-family: 'Plus Jakarta Sans', sans-serif;
    animation: fm-slide-up 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
    overflow: hidden;
  }

  /* ── Header ── */
  .fm-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px 28px 20px;
    border-bottom: 1px solid #f0f4fa;
    background: linear-gradient(160deg, #fafbff 0%, #fff 100%);
    flex-shrink: 0;
    gap: 16px;
  }

  .fm-header-left {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .fm-icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99,102,241,0.28);
  }

  .fm-title {
    margin: 0;
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
    line-height: 1.3;
  }

  .fm-subtitle {
    margin: 3px 0 0;
    font-size: 12.5px;
    color: #94a3b8;
    font-weight: 500;
  }

  .fm-close-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1.5px solid #e8edf5;
    background: #f8fafc;
    color: #64748b;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
    padding: 0;
    font-family: inherit;
    line-height: 1;
  }
  .fm-close-btn:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
  }
  .fm-close-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Error banner ── */
  .fm-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 16px 28px 0;
    padding: 12px 16px;
    background: #fef2f2;
    border: 1.5px solid #fecaca;
    border-radius: 12px;
    color: #991b1b;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .fm-error-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

  /* ── Body ── */
  .fm-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    scrollbar-width: thin;
    scrollbar-color: #e2e8f0 transparent;
  }
  .fm-body::-webkit-scrollbar { width: 5px; }
  .fm-body::-webkit-scrollbar-track { background: transparent; }
  .fm-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

  /* ── Footer ── */
  .fm-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 18px 28px;
    border-top: 1px solid #f0f4fa;
    background: #fafbff;
    flex-shrink: 0;
  }

  .fm-btn-cancel {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    font-size: 13.5px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .fm-btn-cancel:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #334155;
  }
  .fm-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

  .fm-btn-submit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 24px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: #fff;
    font-size: 13.5px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    letter-spacing: 0.1px;
  }
  .fm-btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99,102,241,0.4);
  }
  .fm-btn-submit:active:not(:disabled) { transform: translateY(0); }
  .fm-btn-submit:disabled {
    background: #c7d2fe;
    box-shadow: none;
    cursor: not-allowed;
  }

  /* ── Form field helpers (use these inside forms) ── */
  .fm-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .fm-grid-1 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .fm-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .fm-field.fm-col-span {
    grid-column: 1 / -1;
  }

  .fm-label {
    font-size: 12.5px;
    font-weight: 700;
    color: #374151;
    letter-spacing: 0.2px;
    text-transform: uppercase;
  }

  .fm-input {
    padding: 10px 13px;
    font-size: 13.5px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
    color: #0f172a;
    outline: none;
    transition: all 0.15s ease;
    width: 100%;
    box-sizing: border-box;
  }
  .fm-input::placeholder { color: #b0bac8; }
  .fm-input:focus {
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  .fm-input:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
  .fm-input-error {
    border-color: #ef4444 !important;
  }
  .fm-input-error:focus {
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important;
  }

  .fm-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 13px center;
    padding-right: 34px !important;
    cursor: pointer;
  }

  .fm-textarea {
    resize: vertical;
    min-height: 80px;
    line-height: 1.55;
  }

  .fm-hint {
    font-size: 11.5px;
    color: #94a3b8;
    font-weight: 500;
    margin-top: 2px;
  }

  .fm-section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: #f8fafc;
    border-radius: 10px;
    border-left: 3px solid #6366f1;
    margin-bottom: 4px;
  }
  .fm-section-head span {
    font-size: 12px;
    font-weight: 800;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .fm-info-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: #eff6ff;
    border: 1.5px solid #bfdbfe;
    border-radius: 10px;
    color: #1e40af;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }

  .fm-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .fm-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: fm-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes fm-spin { to { transform: rotate(360deg); } }
`;

function InjectStyles() {
  return <style dangerouslySetInnerHTML={{ __html: FORM_CSS }} />;
}

export default function Form({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  saving = false,
  submitText = "Simpan",
  error,
  children,
  maxWidth = "520px",
  icon = "📋",
}: FormProps) {
  if (!open) return null;

  return (
    <>
      <InjectStyles />
      <div className="fm-backdrop" onMouseDown={onClose}>
        <div
          className="fm-panel"
          style={{ maxWidth }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="fm-header">
            <div className="fm-header-left">
              <div className="fm-icon-wrap">{icon}</div>
              <div>
                <h3 className="fm-title">{title}</h3>
                {subtitle && <p className="fm-subtitle">{subtitle}</p>}
              </div>
            </div>
            <button
              className="fm-close-btn"
              onClick={onClose}
              type="button"
              disabled={saving}
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="fm-error">
              <span className="fm-error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Body */}
          <div className="fm-body">{children}</div>

          {/* Footer */}
          <div className="fm-footer">
            <button
              className="fm-btn-cancel"
              onClick={onClose}
              disabled={saving}
              type="button"
            >
              Batal
            </button>
            <button
              className="fm-btn-submit"
              onClick={onSubmit}
              disabled={saving}
              type="button"
            >
              {saving ? (
                <>
                  <span className="fm-spinner" />
                  Menyimpan…
                </>
              ) : (
                submitText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}