export type BotStatus = "active" | "paused" | "draft";
export type PlanTier = "free" | "pro" | "enterprise";

export interface Bot {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: BotStatus;
  createdAt: string;
  updatedAt: string;
  welcomeMessage: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  messageLimit: number | null;
  planTier: PlanTier;
}

export type WidgetPosition = "bottom-right" | "bottom-left";
export type WidgetButtonSize = "sm" | "md" | "lg";
export type WidgetButtonStyle = "round" | "rounded-square" | "pill-with-label";

export interface WidgetConfig {
  botId: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  companyName: string;
  position: WidgetPosition;
  buttonSize: WidgetButtonSize;
  buttonStyle: WidgetButtonStyle;
  starterPrompts: string[];
}

export type DocStatus = "processing" | "ready" | "error";
export type DocSourceType = "file" | "link";

export interface KnowledgeDocument {
  id: string;
  botId: string;
  sourceType: DocSourceType;
  title: string;
  url?: string;
  sizeBytes?: number;
  status: DocStatus;
  errorMessage?: string;
  addedAt: string;
}

export type MessageRole = "visitor" | "bot" | "operator";

export interface DialogMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
}

export interface VisitorInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  pageUrl?: string;
}

export interface Dialog {
  id: string;
  botId: string;
  startedAt: string;
  endedAt: string | null;
  messages: DialogMessage[];
  visitor: VisitorInfo | null;
  messageCount: number;
  durationSec: number | null;
  leadCaptured: boolean;
}

export interface Lead {
  id: string;
  botId: string;
  dialogId: string;
  name?: string;
  email?: string;
  phone?: string;
  capturedAt: string;
  note?: string;
}

export interface NotificationSettings {
  botId: string;
  emailOnNewLead: boolean;
  notifyEmail: string;
  webhookUrl?: string;
}

export interface AnalyticsPoint {
  date: string;
  visitors: number;
  dialogs: number;
}

export interface PopularQuestion {
  question: string;
  count: number;
}

export type AnalyticsRangeDays = 7 | 30 | 90;

export interface AnalyticsSummary {
  botId: string;
  rangeDays: AnalyticsRangeDays;
  visitorCount: number;
  dialogCount: number;
  avgDialogLengthSec: number;
  avgMessagesPerDialog: number;
  leadConversionRate: number;
  usageByDay: AnalyticsPoint[];
  popularQuestions: PopularQuestion[];
}
