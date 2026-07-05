"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboardData } from "@/lib/dashboard/DashboardDataContext";
import { useToast } from "@/components/dashboard/shared/Toast";
import { Icon } from "@/components/dashboard/icons/Icon";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { DialogTranscript } from "./DialogTranscript";
import { VisitorInfoCard } from "./VisitorInfoCard";
import { formatDateTime, formatDuration } from "@/lib/dashboard/format";

export function DialogDetail({ botId, dialogId }: { botId: string; dialogId: string }) {
  const { getDialog, generateDialogSummary } = useDashboardData();
  const { show } = useToast();
  const [generating, setGenerating] = useState(false);
  const dialog = getDialog(dialogId);

  if (!dialog) {
    return <EmptyState title="Диалог не найден" description="Возможно, он был удалён." />;
  }

  return (
    <div>
      <Link
        href={`/${botId}/dialogs`}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 16, textDecoration: "none", color: "var(--dash-text-secondary)" }}
      >
        <Icon name="arrow-left" size={13} />К списку диалогов
      </Link>

      <div style={{ fontSize: 12, color: "var(--dash-text-tertiary)", marginBottom: 20 }}>
        {formatDateTime(dialog.startedAt)} · {dialog.messageCount} сообщений · {formatDuration(dialog.durationSec)}
      </div>

      <div className="dash-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: dialog.summary ? 8 : 0 }}>
          <div className="dash-content-block-title" style={{ marginBottom: 0 }}>Резюме диалога</div>
          <button
            type="button"
            className="dash-btn"
            style={{ height: 28, fontSize: 12 }}
            disabled={generating || dialog.messages.length === 0}
            title={dialog.messages.length === 0 ? "В диалоге нет сообщений" : undefined}
            onClick={async () => {
              setGenerating(true);
              try {
                await generateDialogSummary(botId, dialogId);
                show("Резюме диалога обновлено", "success");
              } catch (err) {
                show(err instanceof Error ? err.message : "Не удалось сгенерировать резюме", "danger");
              } finally {
                setGenerating(false);
              }
            }}
          >
            <Icon name={generating ? "clock" : "bot"} size={13} />
            {generating ? "Генерируем..." : dialog.summary ? "Обновить" : "Сгенерировать"}
          </button>
        </div>
        {dialog.summary && <div style={{ fontSize: 13, lineHeight: 1.6 }}>{dialog.summary}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>
        <DialogTranscript messages={dialog.messages} />
        <VisitorInfoCard visitor={dialog.visitor} />
      </div>
    </div>
  );
}
