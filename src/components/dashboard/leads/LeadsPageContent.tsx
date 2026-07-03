"use client";

import { useBot } from "@/lib/dashboard/useBot";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { ContentBlock } from "@/components/dashboard/shared/ContentBlock";
import { LeadsTable } from "./LeadsTable";
import { ExportLeadsButton } from "./ExportLeadsButton";
import { NotificationSettingsPanel } from "./NotificationSettingsPanel";

export function LeadsPageContent({ botId }: { botId: string }) {
  const { bot, leads, notificationSettings, data } = useBot(botId);

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  return (
    <>
      <ContentBlock title={`Заявки (${leads.length})`}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <ExportLeadsButton leads={leads} botName={bot.name} />
        </div>
        <LeadsTable botId={botId} leads={leads} />
      </ContentBlock>

      <ContentBlock title="Уведомления">
        <NotificationSettingsPanel
          settings={notificationSettings}
          onSave={(patch) => data.updateNotificationSettings(botId, patch)}
        />
      </ContentBlock>
    </>
  );
}
