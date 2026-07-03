"use client";

import { useDashboardData } from "./DashboardDataContext";

export function useBot(botId: string) {
  const data = useDashboardData();
  const bot = data.getBot(botId);
  const widgetConfig = data.getWidgetConfig(botId);
  const knowledge = data.knowledgeByBot(botId);
  const dialogs = data.dialogsByBot(botId);
  const leads = data.leadsByBot(botId);
  const notificationSettings = data.notificationSettingsByBot(botId);

  return { bot, widgetConfig, knowledge, dialogs, leads, notificationSettings, data };
}
