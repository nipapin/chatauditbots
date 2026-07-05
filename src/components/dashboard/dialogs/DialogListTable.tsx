import Link from "next/link";
import { Pill } from "@/components/dashboard/shared/Pill";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { formatDateTime, formatDuration } from "@/lib/dashboard/format";
import type { Dialog } from "@/lib/dashboard/types";

export function DialogListTable({ botId, dialogs }: { botId: string; dialogs: Dialog[] }) {
  if (dialogs.length === 0) {
    return <EmptyState title="Диалогов не найдено" description="Измените фильтр или дождитесь новых обращений." />;
  }

  return (
    <table className="dash-table">
      <thead>
        <tr>
          <th>Посетитель</th>
          <th>Начало</th>
          <th>Сообщений</th>
          <th>Длительность</th>
          <th>Заявка</th>
        </tr>
      </thead>
      <tbody>
        {dialogs.map((dialog) => (
          <tr key={dialog.id}>
            <td>
              <Link
                href={`/${botId}/dialogs/${dialog.id}`}
                style={{ textDecoration: "none", fontWeight: 500 }}
              >
                {dialog.visitor?.name || dialog.visitor?.email || dialog.visitor?.phone || "Гость"}
              </Link>
              {dialog.isMock && (
                <span style={{ marginLeft: 6 }}>
                  <Pill variant="warning">мокап</Pill>
                </span>
              )}
              {dialog.visitor?.location && (
                <div style={{ fontSize: 11, color: "var(--dash-text-tertiary)" }}>{dialog.visitor.location}</div>
              )}
            </td>
            <td>{formatDateTime(dialog.startedAt)}</td>
            <td>{dialog.messageCount}</td>
            <td>{formatDuration(dialog.durationSec)}</td>
            <td>{dialog.leadCaptured ? <Pill variant="success">Есть</Pill> : <Pill variant="neutral">Нет</Pill>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
