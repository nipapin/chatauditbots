import "server-only";
import { query } from "./db";
import type { NotificationSettings } from "@/lib/dashboard/types";

interface NotificationRow {
  bot_id: string;
  email_on_new_lead: boolean;
  notify_email: string | null;
  webhook_url: string | null;
}

function rowToSettings(row: NotificationRow): NotificationSettings {
  return {
    botId: row.bot_id,
    emailOnNewLead: row.email_on_new_lead,
    notifyEmail: row.notify_email ?? "",
    webhookUrl: row.webhook_url ?? undefined,
  };
}

const SETTINGS_SELECT = `ns.bot_id, ns.email_on_new_lead, ns.notify_email, ns.webhook_url`;

export async function listNotificationSettingsForUser(userId: string): Promise<NotificationSettings[]> {
  const { rows } = await query<NotificationRow>(
    `select ${SETTINGS_SELECT}
     from notification_settings ns
     join bots b on b.id = ns.bot_id
     where b.user_id = $1`,
    [userId]
  );
  return rows.map(rowToSettings);
}

const PATCHABLE_FIELDS: Record<string, string> = {
  emailOnNewLead: "email_on_new_lead",
  notifyEmail: "notify_email",
  webhookUrl: "webhook_url",
};

export async function updateNotificationSettingsForUser(
  userId: string,
  botId: string,
  patch: Partial<NotificationSettings>
): Promise<NotificationSettings | null> {
  const entries = Object.entries(patch).filter(([key]) => key in PATCHABLE_FIELDS);
  if (entries.length === 0) {
    const { rows } = await query<NotificationRow>(
      `select ${SETTINGS_SELECT} from notification_settings ns
       join bots b on b.id = ns.bot_id
       where ns.bot_id = $1 and b.user_id = $2`,
      [botId, userId]
    );
    return rows[0] ? rowToSettings(rows[0]) : null;
  }

  const setClauses = entries.map(([key], i) => `${PATCHABLE_FIELDS[key]} = $${i + 3}`);
  const values = entries.map(([, value]) => value);

  const { rows } = await query<NotificationRow>(
    `update notification_settings ns set ${setClauses.join(", ")}
     from bots b
     where ns.bot_id = $1 and b.id = ns.bot_id and b.user_id = $2
     returning ${SETTINGS_SELECT}`,
    [botId, userId, ...values]
  );
  return rows[0] ? rowToSettings(rows[0]) : null;
}
