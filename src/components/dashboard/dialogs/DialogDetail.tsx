"use client";

import Link from "next/link";
import { useDashboardData } from "@/lib/dashboard/DashboardDataContext";
import { Icon } from "@/components/dashboard/icons/Icon";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { DialogTranscript } from "./DialogTranscript";
import { VisitorInfoCard } from "./VisitorInfoCard";
import { formatDateTime, formatDuration } from "@/lib/dashboard/format";

export function DialogDetail({ botId, dialogId }: { botId: string; dialogId: string }) {
  const { getDialog } = useDashboardData();
  const dialog = getDialog(dialogId);

  if (!dialog) {
    return <EmptyState title="Диалог не найден" description="Возможно, он был удалён." />;
  }

  return (
    <div>
      <Link
        href={`/bots/${botId}/dialogs`}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 16, textDecoration: "none", color: "var(--dash-text-secondary)" }}
      >
        <Icon name="arrow-left" size={13} />К списку диалогов
      </Link>

      <div style={{ fontSize: 12, color: "var(--dash-text-tertiary)", marginBottom: 20 }}>
        {formatDateTime(dialog.startedAt)} · {dialog.messageCount} сообщений · {formatDuration(dialog.durationSec)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>
        <DialogTranscript messages={dialog.messages} />
        <VisitorInfoCard visitor={dialog.visitor} />
      </div>
    </div>
  );
}
