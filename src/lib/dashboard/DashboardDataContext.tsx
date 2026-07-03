"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { generateId } from "./id";
import {
  MOCK_BOTS,
  MOCK_DIALOGS,
  MOCK_KNOWLEDGE,
  MOCK_LEADS,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_WIDGET_CONFIGS,
} from "./mock-data";
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
  createBot: (name: string) => Bot;
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

function simulateProcessing(
  docId: string,
  setDocs: React.Dispatch<React.SetStateAction<KnowledgeDocument[]>>
) {
  setTimeout(() => {
    setDocs((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status: "ready" as DocStatus } : doc))
    );
  }, 2200);
}

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [bots, setBots] = useState<Bot[]>(MOCK_BOTS);
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(MOCK_WIDGET_CONFIGS);
  const [knowledge, setKnowledge] = useState<KnowledgeDocument[]>(MOCK_KNOWLEDGE);
  const [dialogs] = useState<Dialog[]>(MOCK_DIALOGS);
  const [leads] = useState<Lead[]>(MOCK_LEADS);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings[]>(
    MOCK_NOTIFICATION_SETTINGS
  );

  const createBot = useCallback((name: string): Bot => {
    const id = generateId("bot");
    const now = new Date().toISOString();
    const bot: Bot = {
      id,
      name,
      avatarUrl: null,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      welcomeMessage: "Здравствуйте! Чем могу помочь?",
      systemPrompt: "Ты — вежливый ассистент компании. Отвечай кратко и по делу.",
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.9,
      messageLimit: 20,
      planTier: "free",
    };
    setBots((prev) => [bot, ...prev]);
    setWidgetConfigs((prev) => [
      ...prev,
      {
        botId: id,
        primaryColor: "#3b6d11",
        accentColor: "#eaf3de",
        logoUrl: null,
        companyName: name,
        position: "bottom-right",
        buttonSize: "md",
        buttonStyle: "round",
        starterPrompts: [],
      },
    ]);
    setNotificationSettings((prev) => [
      ...prev,
      { botId: id, emailOnNewLead: false, notifyEmail: "" },
    ]);
    return bot;
  }, []);

  const updateBot = useCallback((botId: string, patch: Partial<Bot>) => {
    setBots((prev) =>
      prev.map((bot) =>
        bot.id === botId ? { ...bot, ...patch, updatedAt: new Date().toISOString() } : bot
      )
    );
  }, []);

  const deleteBot = useCallback((botId: string) => {
    setBots((prev) => prev.filter((bot) => bot.id !== botId));
    setWidgetConfigs((prev) => prev.filter((cfg) => cfg.botId !== botId));
    setKnowledge((prev) => prev.filter((doc) => doc.botId !== botId));
    setNotificationSettings((prev) => prev.filter((s) => s.botId !== botId));
  }, []);

  const getBot = useCallback((botId: string) => bots.find((b) => b.id === botId), [bots]);

  const getWidgetConfig = useCallback(
    (botId: string): WidgetConfig => {
      const found = widgetConfigs.find((c) => c.botId === botId);
      if (found) return found;
      return {
        botId,
        primaryColor: "#3b6d11",
        accentColor: "#eaf3de",
        logoUrl: null,
        companyName: "",
        position: "bottom-right",
        buttonSize: "md",
        buttonStyle: "round",
        starterPrompts: [],
      };
    },
    [widgetConfigs]
  );

  const updateWidgetConfig = useCallback((botId: string, patch: Partial<WidgetConfig>) => {
    setWidgetConfigs((prev) => {
      const exists = prev.some((c) => c.botId === botId);
      if (!exists) {
        return [...prev, { botId, primaryColor: "#3b6d11", accentColor: "#eaf3de", logoUrl: null, companyName: "", position: "bottom-right", buttonSize: "md", buttonStyle: "round", starterPrompts: [], ...patch }];
      }
      return prev.map((c) => (c.botId === botId ? { ...c, ...patch } : c));
    });
  }, []);

  const knowledgeByBot = useCallback(
    (botId: string) => knowledge.filter((doc) => doc.botId === botId),
    [knowledge]
  );

  const addKnowledgeFile = useCallback((botId: string, title: string, sizeBytes: number) => {
    const id = generateId("doc");
    setKnowledge((prev) => [
      { id, botId, sourceType: "file", title, sizeBytes, status: "processing", addedAt: new Date().toISOString() },
      ...prev,
    ]);
    simulateProcessing(id, setKnowledge);
  }, []);

  const addKnowledgeLink = useCallback((botId: string, title: string, url: string) => {
    const id = generateId("doc");
    setKnowledge((prev) => [
      { id, botId, sourceType: "link", title, url, status: "processing", addedAt: new Date().toISOString() },
      ...prev,
    ]);
    simulateProcessing(id, setKnowledge);
  }, []);

  const deleteKnowledgeDoc = useCallback((docId: string) => {
    setKnowledge((prev) => prev.filter((doc) => doc.id !== docId));
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
      notificationSettings.find((s) => s.botId === botId) ?? {
        botId,
        emailOnNewLead: false,
        notifyEmail: "",
      },
    [notificationSettings]
  );

  const updateNotificationSettings = useCallback(
    (botId: string, patch: Partial<NotificationSettings>) => {
      setNotificationSettings((prev) => {
        const exists = prev.some((s) => s.botId === botId);
        if (!exists) {
          return [...prev, { botId, emailOnNewLead: false, notifyEmail: "", ...patch }];
        }
        return prev.map((s) => (s.botId === botId ? { ...s, ...patch } : s));
      });
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
