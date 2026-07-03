import { verifySession } from "@/lib/server/dal";
import { listBotsForUser } from "@/lib/server/bots";
import { listWidgetConfigsForUser } from "@/lib/server/widgetConfigs";
import { listKnowledgeForUser } from "@/lib/server/knowledge";
import { listDialogsForUser } from "@/lib/server/dialogs";
import { listLeadsForUser } from "@/lib/server/leads";
import { listNotificationSettingsForUser } from "@/lib/server/notificationSettings";
import { DashboardDataProvider } from "@/lib/dashboard/DashboardDataContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await verifySession();

  const [bots, widgetConfigs, knowledge, dialogs, leads, notificationSettings] = await Promise.all([
    listBotsForUser(userId),
    listWidgetConfigsForUser(userId),
    listKnowledgeForUser(userId),
    listDialogsForUser(userId),
    listLeadsForUser(userId),
    listNotificationSettingsForUser(userId),
  ]);

  return (
    <DashboardDataProvider
      initialBots={bots}
      initialWidgetConfigs={widgetConfigs}
      initialKnowledge={knowledge}
      initialDialogs={dialogs}
      initialLeads={leads}
      initialNotificationSettings={notificationSettings}
    >
      {children}
    </DashboardDataProvider>
  );
}
