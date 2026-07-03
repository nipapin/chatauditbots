"use client";

import { Modal } from "./Modal";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Удалить",
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
        {description}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" className="dash-btn" onClick={onClose}>
          Отмена
        </button>
        <button
          type="button"
          className="dash-btn dash-btn-danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
