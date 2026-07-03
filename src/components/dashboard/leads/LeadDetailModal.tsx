import Link from "next/link";
import { Modal } from "@/components/dashboard/shared/Modal";
import { formatDateTime } from "@/lib/dashboard/format";
import type { Lead } from "@/lib/dashboard/types";

export function LeadDetailModal({
  lead,
  botId,
  onClose,
}: {
  lead: Lead;
  botId: string;
  onClose: () => void;
}) {
  return (
    <Modal title={lead.name || "Заявка"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
        {lead.phone && (
          <div>
            <span style={{ color: "var(--dash-text-tertiary)" }}>Телефон: </span>
            {lead.phone}
          </div>
        )}
        {lead.email && (
          <div>
            <span style={{ color: "var(--dash-text-tertiary)" }}>Email: </span>
            {lead.email}
          </div>
        )}
        <div>
          <span style={{ color: "var(--dash-text-tertiary)" }}>Получена: </span>
          {formatDateTime(lead.capturedAt)}
        </div>
        {lead.note && (
          <div
            style={{
              background: "var(--dash-bg-subtle)",
              borderRadius: "var(--dash-radius-md)",
              padding: 10,
              color: "var(--dash-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            {lead.note}
          </div>
        )}
      </div>
      <Link
        href={`/bots/${botId}/dialogs/${lead.dialogId}`}
        className="dash-btn"
        style={{ marginTop: 16, width: "100%" }}
      >
        Открыть диалог, из которого пришла заявка
      </Link>
    </Modal>
  );
}
