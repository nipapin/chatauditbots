"use client";

import { useDashboardData } from "@/lib/dashboard/DashboardDataContext";
import { DashboardHeader } from "./DashboardHeader";
import { Sidebar } from "./Sidebar";
import { ContentPanel } from "./ContentPanel";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";

export function BotEditorShell({
  botId,
  children,
}: {
  botId: string;
  children: React.ReactNode;
}) {
  const { getBot } = useDashboardData();
  const bot = getBot(botId);

  if (!bot) {
    return (
      <>
        <DashboardHeader />
        <div className="dash-app">
          <ContentPanel>
            <EmptyState title="Бот не найден" description="Возможно, он был удалён. Вернитесь к списку ботов." />
          </ContentPanel>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader bot={bot} />
      <div className="dash-app">
        <Sidebar botId={botId} />
        <ContentPanel>{children}</ContentPanel>
      </div>
    </>
  );
}
