"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
  AnalyticsRangeDays,
  AnalyticsSummary,
  Bot,
  Dialog,
  DocStatus,
  KnowledgeDocument,
  Lead,
  NotificationSettings,
  WidgetConfig,
} from "./types";

interface DashboardDataValue {
  bots: Bot[];
  createBot: (name: string) => Promise<Bot>;
  updateBot: (botId: string, patch: Partial<Bot>) => void;
  deleteBot: (botId: string) => void;
  getBot: (botId: string) => Bot | undefined;

  getWidgetConfig: (botId: string) => WidgetConfig;
  updateWidgetConfig: (botId: string, patch: Partial<WidgetConfig>) => void;

  knowledgeByBot: (botId: string) => KnowledgeDocument[];
  addKnowledgeFile: (botId: string, title: string, sizeBytes: number) => void;
  addKnowledgeLink: (botId: string, title: string, url: string) => void;
  deleteKnowledgeDoc: (docId: string) => void;

  dialogsByBot: (botId: string) => Dialog[];
  getDialog: (dialogId: string) => Dialog | undefined;

  leadsByBot: (botId: string) => Lead[];

  notificationSettingsByBot: (botId: string) => NotificationSettings;
  updateNotificationSettings: (botId: string, patch: Partial<NotificationSettings>) => void;

  analyticsByBot: (botId: string, rangeDays: AnalyticsRangeDays) => AnalyticsSummary;
}

const DashboardDataContext = createContext<DashboardDataValue | null>(null);

const DEFAULT_WIDGET_CONFIG: Omit<WidgetConfig, "botId" | "companyName"> = {
  primaryColor: "#3b6d11",
  accentColor: "#eaf3de",
  logoUrl: null,
  position: "bottom-right",
  buttonSize: "md",
  buttonStyle: "round",
  starterPrompts: [],
};

const DEFAULT_NOTIFICATION_SETTINGS: Omit<NotificationSettings, "botId"> = {
  emailOnNewLead: false,
  notifyEmail: "",
};

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Запрос ${url} завершился с ошибкой ${res.status}`);
  }
  return res.json();
}

function findDocStatusDoneDelay() {
  return 2200;
}

export function DashboardDataProvider({
  children,
  initialBots,
  initialWidgetConfigs,
  initialKnowledge,
  initialDialogs,
  initialLeads,
  initialNotificationSettings,
}: {
  children: React.ReactNode;
  initialBots: Bot[];
  initialWidgetConfigs: WidgetConfig[];
  initialKnowledge: KnowledgeDocument[];
  initialDialogs: Dialog[];
  initialLeads: Lead[];
  initialNotificationSettings: NotificationSettings[];
}) {
  const [bots, setBots] = useState<Bot[]>(initialBots);
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(initialWidgetConfigs);
  const [knowledge, setKnowledge] = useState<KnowledgeDocument[]>(initialKnowledge);
  const [dialogs] = useState<Dialog[]>(initialDialogs);
  const [leads] = useState<Lead[]>(initialLeads);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings[]>(
    initialNotificationSettings
  );

  const createBot = useCallback(async (name: string): Promise<Bot> => {
    const { bot, widgetConfig, notificationSettings: ns } = await apiRequest<{
      bot: Bot;
      widgetConfig: WidgetConfig;
      notificationSettings: NotificationSettings;
    }>("/api/bots", { method: "POST", body: JSON.stringify({ name }) });
    setBots((prev) => [bot, ...prev]);
    setWidgetConfigs((prev) => [...prev, widgetConfig]);
    setNotificationSettings((prev) => [...prev, ns]);
    return bot;
  }, []);

  const updateBot = useCallback((botId: string, patch: Partial<Bot>) => {
    setBots((prev) =>
      prev.map((bot) =>
        bot.id === botId ? { ...bot, ...patch, updatedAt: new Date().toISOString() } : bot
      )
    );
    apiRequest(`/api/bots/${botId}`, { method: "PATCH", body: JSON.stringify(patch) }).catch((err) =>
      console.error("Не удалось сохранить бота", err)
    );
  }, []);

  const deleteBot = useCallback((botId: string) => {
    setBots((prev) => prev.filter((bot) => bot.id !== botId));
    setWidgetConfigs((prev) => prev.filter((cfg) => cfg.botId !== botId));
    setKnowledge((prev) => prev.filter((doc) => doc.botId !== botId));
    setNotificationSettings((prev) => prev.filter((s) => s.botId !== botId));
    apiRequest(`/api/bots/${botId}`, { method: "DELETE" }).catch((err) =>
      console.error("Не удалось удалить бота", err)
    );
  }, []);

  const getBot = useCallback((botId: string) => bots.find((b) => b.id === botId), [bots]);

  const getWidgetConfig = useCallback(
    (botId: string): WidgetConfig => {
      const found = widgetConfigs.find((c) => c.botId === botId);
      if (found) return found;
      return { botId, companyName: "", ...DEFAULT_WIDGET_CONFIG };
    },
    [widgetConfigs]
  );

  const updateWidgetConfig = useCallback((botId: string, patch: Partial<WidgetConfig>) => {
    setWidgetConfigs((prev) => {
      const exists = prev.some((c) => c.botId === botId);
      if (!exists) {
        return [...prev, { botId, companyName: "", ...DEFAULT_WIDGET_CONFIG, ...patch }];
      }
      return prev.map((c) => (c.botId === botId ? { ...c, ...patch } : c));
    });
    apiRequest(`/api/bots/${botId}/widget`, { method: "PATCH", body: JSON.stringify(patch) }).catch((err) =>
      console.error("Не удалось сохранить внешний вид виджета", err)
    );
  }, []);

  const knowledgeByBot = useCallback(
    (botId: string) => knowledge.filter((doc) => doc.botId === botId),
    [knowledge]
  );

  const scheduleReady = useCallback((botId: string, docId: string) => {
    setTimeout(() => {
      setKnowledge((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, status: "ready" as DocStatus } : doc))
      );
      apiRequest(`/api/bots/${botId}/knowledge/${docId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ready" }),
      }).catch((err) => console.error("Не удалось обновить статус документа", err));
    }, findDocStatusDoneDelay());
  }, []);

  const addKnowledgeFile = useCallback(
    (botId: string, title: string, sizeBytes: number) => {
      apiRequest<{ document: KnowledgeDocument }>(`/api/bots/${botId}/knowledge`, {
        method: "POST",
        body: JSON.stringify({ sourceType: "file", title, sizeBytes }),
      })
        .then(({ document }) => {
          setKnowledge((prev) => [document, ...prev]);
          scheduleReady(botId, document.id);
        })
        .catch((err) => console.error("Не удалось добавить файл", err));
    },
    [scheduleReady]
  );

  const addKnowledgeLink = useCallback(
    (botId: string, title: string, url: string) => {
      apiRequest<{ document: KnowledgeDocument }>(`/api/bots/${botId}/knowledge`, {
        method: "POST",
        body: JSON.stringify({ sourceType: "link", title, url }),
      })
        .then(({ document }) => {
          setKnowledge((prev) => [document, ...prev]);
          scheduleReady(botId, document.id);
        })
        .catch((err) => console.error("Не удалось добавить ссылку", err));
    },
    [scheduleReady]
  );

  const deleteKnowledgeDoc = useCallback((docId: string) => {
    let botId: string | undefined;
    setKnowledge((prev) => {
      botId = prev.find((doc) => doc.id === docId)?.botId;
      return prev.filter((doc) => doc.id !== docId);
    });
    if (botId) {
      apiRequest(`/api/bots/${botId}/knowledge/${docId}`, { method: "DELETE" }).catch((err) =>
        console.error("Не удалось удалить документ", err)
      );
    }
  }, []);

  const dialogsByBot = useCallback(
    (botId: string) =>
      dialogs
        .filter((d) => d.botId === botId)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
    [dialogs]
  );

  const getDialog = useCallback((dialogId: string) => dialogs.find((d) => d.id === dialogId), [dialogs]);

  const leadsByBot = useCallback(
    (botId: string) =>
      leads
        .filter((l) => l.botId === botId)
        .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()),
    [leads]
  );

  const notificationSettingsByBot = useCallback(
    (botId: string): NotificationSettings =>
      notificationSettings.find((s) => s.botId === botId) ?? { botId, ...DEFAULT_NOTIFICATION_SETTINGS },
    [notificationSettings]
  );

  const updateNotificationSettings = useCallback(
    (botId: string, patch: Partial<NotificationSettings>) => {
      setNotificationSettings((prev) => {
        const exists = prev.some((s) => s.botId === botId);
        if (!exists) {
          return [...prev, { botId, ...DEFAULT_NOTIFICATION_SETTINGS, ...patch }];
        }
        return prev.map((s) => (s.botId === botId ? { ...s, ...patch } : s));
      });
      apiRequest(`/api/bots/${botId}/notifications`, { method: "PATCH", body: JSON.stringify(patch) }).catch(
        (err) => console.error("Не удалось сохранить настройки уведомлений", err)
      );
    },
    []
  );

  const analyticsByBot = useCallback(
    (botId: string, rangeDays: AnalyticsRangeDays): AnalyticsSummary => {
      const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;
      const botDialogs = dialogs.filter(
        (d) => d.botId === botId && new Date(d.startedAt).getTime() >= cutoff
      );
      const botLeads = leads.filter(
        (l) => l.botId === botId && new Date(l.capturedAt).getTime() >= cutoff
      );

      const dialogCount = botDialogs.length;
      const visitorCount = new Set(
        botDialogs.map((d) => d.visitor?.email ?? d.visitor?.phone ?? d.id)
      ).size;
      const totalDuration = botDialogs.reduce((sum, d) => sum + (d.durationSec ?? 0), 0);
      const totalMessages = botDialogs.reduce((sum, d) => sum + d.messageCount, 0);
      const avgDialogLengthSec = dialogCount ? Math.round(totalDuration / dialogCount) : 0;
      const avgMessagesPerDialog = dialogCount ? Math.round((totalMessages / dialogCount) * 10) / 10 : 0;
      const leadConversionRate = dialogCount ? botLeads.length / dialogCount : 0;

      const usageByDay: AnalyticsSummary["usageByDay"] = [];
      for (let i = rangeDays - 1; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        dayStart.setDate(dayStart.getDate() - i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const dayDialogs = botDialogs.filter((d) => {
          const t = new Date(d.startedAt).getTime();
          return t >= dayStart.getTime() && t < dayEnd.getTime();
        });
        usageByDay.push({
          date: dayStart.toISOString(),
          dialogs: dayDialogs.length,
          visitors: new Set(dayDialogs.map((d) => d.visitor?.email ?? d.visitor?.phone ?? d.id)).size,
        });
      }

      const questionCounts = new Map<string, number>();
      for (const d of botDialogs) {
        for (const m of d.messages) {
          if (m.role !== "visitor") continue;
          const key = m.text.trim();
          questionCounts.set(key, (questionCounts.get(key) ?? 0) + 1);
        }
      }
      const popularQuestions = [...questionCounts.entries()]
        .map(([question, count]) => ({ question, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return {
        botId,
        rangeDays,
        visitorCount,
        dialogCount,
        avgDialogLengthSec,
        avgMessagesPerDialog,
        leadConversionRate,
        usageByDay,
        popularQuestions,
      };
    },
    [dialogs, leads]
  );

  const value = useMemo<DashboardDataValue>(
    () => ({
      bots,
      createBot,
      updateBot,
      deleteBot,
      getBot,
      getWidgetConfig,
      updateWidgetConfig,
      knowledgeByBot,
      addKnowledgeFile,
      addKnowledgeLink,
      deleteKnowledgeDoc,
      dialogsByBot,
      getDialog,
      leadsByBot,
      notificationSettingsByBot,
      updateNotificationSettings,
      analyticsByBot,
    }),
    [
      bots,
      createBot,
      updateBot,
      deleteBot,
      getBot,
      getWidgetConfig,
      updateWidgetConfig,
      knowledgeByBot,
      addKnowledgeFile,
      addKnowledgeLink,
      deleteKnowledgeDoc,
      dialogsByBot,
      getDialog,
      leadsByBot,
      notificationSettingsByBot,
      updateNotificationSettings,
      analyticsByBot,
    ]
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData(): DashboardDataValue {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return ctx;
}
