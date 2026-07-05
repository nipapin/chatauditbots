import "server-only";
import { query } from "./db";
import type {
  Bot,
  NotificationSettings,
  WidgetButtonSize,
  WidgetButtonStyle,
  WidgetConfig,
  WidgetPosition,
  WidgetTheme,
} from "@/lib/dashboard/types";

interface BotRow {
  id: string;
  name: string;
  avatar_url: string | null;
  status: Bot["status"];
  created_at: Date;
  updated_at: Date;
  welcome_message: string | null;
  system_prompt: string | null;
  temperature: string | null;
  max_tokens: number | null;
  top_p: string | null;
  message_limit: number | null;
  plan_tier: Bot["planTier"];
  contact_email: string | null;
  contact_phone: string | null;
  knowledge_summary: string | null;
  knowledge_summary_updated_at: Date | null;
}

function rowToBot(row: BotRow): Bot {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    welcomeMessage: row.welcome_message ?? "",
    systemPrompt: row.system_prompt ?? "",
    temperature: row.temperature !== null ? Number(row.temperature) : 0.7,
    maxTokens: row.max_tokens ?? 500,
    topP: row.top_p !== null ? Number(row.top_p) : 0.9,
    messageLimit: row.message_limit,
    planTier: row.plan_tier,
    contactEmail: row.contact_email ?? "",
    contactPhone: row.contact_phone ?? "",
    knowledgeSummary: row.knowledge_summary,
    knowledgeSummaryUpdatedAt: row.knowledge_summary_updated_at
      ? row.knowledge_summary_updated_at.toISOString()
      : null,
  };
}

const BOT_COLUMNS = `id, name, avatar_url, status, created_at, updated_at, welcome_message, system_prompt, temperature, max_tokens, top_p, message_limit, plan_tier, contact_email, contact_phone, knowledge_summary, knowledge_summary_updated_at`;

export async function listBotsForUser(userId: string): Promise<Bot[]> {
  const { rows } = await query<BotRow>(
    `select ${BOT_COLUMNS} from bots where user_id = $1 order by created_at desc`,
    [userId]
  );
  return rows.map(rowToBot);
}

export interface CreateBotResult {
  bot: Bot;
  widgetConfig: WidgetConfig;
  notificationSettings: NotificationSettings;
}

export async function createBotForUser(userId: string, name: string): Promise<CreateBotResult> {
  const { rows } = await query<BotRow>(
    `insert into bots (user_id, name, status, welcome_message, system_prompt, temperature, max_tokens, top_p, message_limit, plan_tier)
     values ($1, $2, 'draft', $3, $4, 0.7, 500, 0.9, 20, 'free')
     returning ${BOT_COLUMNS}`,
    [userId, name, "Здравствуйте! Чем могу помочь?", "Ты — вежливый ассистент компании. Отвечай кратко и по делу."]
  );
  const bot = rowToBot(rows[0]);

  const { rows: widgetRows } = await query<{
    bot_id: string;
    primary_color_light: string;
    bot_bubble_color_light: string;
    user_bubble_color_light: string;
    background_color_light: string;
    primary_color_dark: string;
    bot_bubble_color_dark: string;
    user_bubble_color_dark: string;
    background_color_dark: string;
    theme: string;
    subtitle: string;
    company_name: string;
    position: string;
    button_size: string;
    button_style: string;
    starter_prompts: string[];
  }>(
    `insert into widget_configs (
       bot_id, primary_color_light, bot_bubble_color_light, user_bubble_color_light, background_color_light,
       primary_color_dark, bot_bubble_color_dark, user_bubble_color_dark, background_color_dark,
       theme, subtitle, company_name, position, button_size, button_style, starter_prompts
     )
     values ($1, '#3b6d11', '#eaf3de', '#3b6d11', '#ffffff', '#3b6d11', '#2e3a22', '#3b6d11', '#1c1c1e', 'light', 'Онлайн-чат', $2, 'bottom-right', 'md', 'round', '[]'::jsonb)
     returning bot_id, primary_color_light, bot_bubble_color_light, user_bubble_color_light, background_color_light,
       primary_color_dark, bot_bubble_color_dark, user_bubble_color_dark, background_color_dark,
       theme, subtitle, company_name, position, button_size, button_style, starter_prompts`,
    [bot.id, name]
  );
  const widgetRow = widgetRows[0];
  const widgetConfig: WidgetConfig = {
    botId: widgetRow.bot_id,
    primaryColorLight: widgetRow.primary_color_light,
    botBubbleColorLight: widgetRow.bot_bubble_color_light,
    userBubbleColorLight: widgetRow.user_bubble_color_light,
    backgroundColorLight: widgetRow.background_color_light,
    primaryColorDark: widgetRow.primary_color_dark,
    botBubbleColorDark: widgetRow.bot_bubble_color_dark,
    userBubbleColorDark: widgetRow.user_bubble_color_dark,
    backgroundColorDark: widgetRow.background_color_dark,
    theme: widgetRow.theme as WidgetTheme,
    subtitle: widgetRow.subtitle,
    companyName: widgetRow.company_name,
    position: widgetRow.position as WidgetPosition,
    buttonSize: widgetRow.button_size as WidgetButtonSize,
    buttonStyle: widgetRow.button_style as WidgetButtonStyle,
    starterPrompts: widgetRow.starter_prompts,
  };

  const { rows: notifRows } = await query<{
    bot_id: string;
    email_on_new_lead: boolean;
    notify_email: string | null;
    webhook_url: string | null;
  }>(
    `insert into notification_settings (bot_id, email_on_new_lead, notify_email)
     values ($1, false, '')
     returning bot_id, email_on_new_lead, notify_email, webhook_url`,
    [bot.id]
  );
  const notifRow = notifRows[0];
  const notificationSettings: NotificationSettings = {
    botId: notifRow.bot_id,
    emailOnNewLead: notifRow.email_on_new_lead,
    notifyEmail: notifRow.notify_email ?? "",
    webhookUrl: notifRow.webhook_url ?? undefined,
  };

  return { bot, widgetConfig, notificationSettings };
}

const PATCHABLE_FIELDS: Record<string, string> = {
  name: "name",
  avatarUrl: "avatar_url",
  status: "status",
  welcomeMessage: "welcome_message",
  systemPrompt: "system_prompt",
  temperature: "temperature",
  maxTokens: "max_tokens",
  topP: "top_p",
  messageLimit: "message_limit",
  planTier: "plan_tier",
  contactEmail: "contact_email",
  contactPhone: "contact_phone",
};

export async function updateBotForUser(userId: string, botId: string, patch: Partial<Bot>): Promise<Bot | null> {
  const entries = Object.entries(patch).filter(([key]) => key in PATCHABLE_FIELDS);
  if (entries.length === 0) {
    const { rows } = await query<BotRow>(
      `select ${BOT_COLUMNS} from bots where id = $1 and user_id = $2`,
      [botId, userId]
    );
    return rows[0] ? rowToBot(rows[0]) : null;
  }

  const setClauses = entries.map(([key], i) => `${PATCHABLE_FIELDS[key]} = $${i + 3}`);
  const values = entries.map(([, value]) => value);

  const { rows } = await query<BotRow>(
    `update bots set ${setClauses.join(", ")}, updated_at = now()
     where id = $1 and user_id = $2
     returning ${BOT_COLUMNS}`,
    [botId, userId, ...values]
  );
  return rows[0] ? rowToBot(rows[0]) : null;
}

export async function deleteBotForUser(userId: string, botId: string): Promise<void> {
  await query("delete from bots where id = $1 and user_id = $2", [botId, userId]);
}

export async function updateKnowledgeSummaryForUser(
  userId: string,
  botId: string,
  summary: string
): Promise<Bot | null> {
  const { rows } = await query<BotRow>(
    `update bots set knowledge_summary = $1, knowledge_summary_updated_at = now()
     where id = $2 and user_id = $3
     returning ${BOT_COLUMNS}`,
    [summary, botId, userId]
  );
  return rows[0] ? rowToBot(rows[0]) : null;
}
