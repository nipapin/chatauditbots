"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { formatDateTime } from "@/lib/dashboard/format";
import { LeadDetailModal } from "./LeadDetailModal";
import type { Lead } from "@/lib/dashboard/types";

export function LeadsTable({ botId, leads }: { botId: string; leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);

  if (leads.length === 0) {
    return <EmptyState title="Заявок пока нет" description="Здесь появятся контакты, оставленные в диалогах." />;
  }

  return (
    <>
      <table className="dash-table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Получена</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} style={{ cursor: "pointer" }} onClick={() => setSelected(lead)}>
              <td style={{ fontWeight: 500 }}>{lead.name || "—"}</td>
              <td>{lead.phone || "—"}</td>
              <td>{lead.email || "—"}</td>
              <td>{formatDateTime(lead.capturedAt)}</td>
              <td>
                <Link
                  href={`/bots/${botId}/dialogs/${lead.dialogId}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 12, color: "var(--dash-info-fg)", textDecoration: "none" }}
                >
                  Диалог →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && <LeadDetailModal lead={selected} botId={botId} onClose={() => setSelected(null)} />}
    </>
  );
}
