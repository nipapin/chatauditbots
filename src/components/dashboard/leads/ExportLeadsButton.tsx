"use client";

import { Icon } from "@/components/dashboard/icons/Icon";
import { buildCsv, downloadBlob } from "@/lib/dashboard/export";
import { formatDateTime } from "@/lib/dashboard/format";
import type { Lead } from "@/lib/dashboard/types";

export function ExportLeadsButton({ leads, botName }: { leads: Lead[]; botName: string }) {
  return (
    <button
      type="button"
      className="dash-btn"
      disabled={leads.length === 0}
      onClick={() => {
        const csv = buildCsv(
          ["Имя", "Телефон", "Email", "Получена", "Заметка"],
          leads.map((lead) => [lead.name, lead.phone, lead.email, formatDateTime(lead.capturedAt), lead.note])
        );
        downloadBlob(`leads-${botName.replace(/\s+/g, "_")}.csv`, csv, "text/csv;charset=utf-8");
      }}
    >
      <Icon name="download" size={14} />
      Экспорт CSV
    </button>
  );
}
