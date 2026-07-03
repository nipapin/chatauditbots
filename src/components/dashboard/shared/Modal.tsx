"use client";

import { Icon } from "@/components/dashboard/icons/Icon";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="dash-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dash-modal-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="dash-btn"
            style={{ width: 30, height: 30, padding: 0 }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
