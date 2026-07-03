import "server-only";
import { query } from "./db";
import type { WidgetButtonSize, WidgetButtonStyle, WidgetConfig, WidgetPosition } from "@/lib/dashboard/types";

interface WidgetConfigRow {
  bot_id: string;
  primary_color: string;
  accent_color: string;
  logo_url: string | null;
  company_name: string;
  position: string;
  button_size: string;
  button_style: string;
  starter_prompts: string[];
}

function rowToWidgetConfig(row: WidgetConfigRow): WidgetConfig {
  return {
    botId: row.bot_id,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    logoUrl: row.logo_url,
    companyName: row.company_name,
    position: row.position as WidgetPosition,
    buttonSize: row.button_size as WidgetButtonSize,
    buttonStyle: row.button_style as WidgetButtonStyle,
    starterPrompts: row.starter_prompts,
  };
}

const WIDGET_SELECT = `wc.bot_id, wc.primary_color, wc.accent_color, wc.logo_url, wc.company_name, wc.position, wc.button_size, wc.button_style, wc.starter_prompts`;

export async function listWidgetConfigsForUser(userId: string): Promise<WidgetConfig[]> {
  const { rows } = await query<WidgetConfigRow>(
    `select ${WIDGET_SELECT}
     from widget_configs wc
     join bots b on b.id = wc.bot_id
     where b.user_id = $1`,
    [userId]
  );
  return rows.map(rowToWidgetConfig);
}

const PATCHABLE_FIELDS: Record<string, string> = {
  primaryColor: "primary_color",
  accentColor: "accent_color",
  logoUrl: "logo_url",
  companyName: "company_name",
  position: "position",
  buttonSize: "button_size",
  buttonStyle: "button_style",
  starterPrompts: "starter_prompts",
};

export async function updateWidgetConfigForUser(
  userId: string,
  botId: string,
  patch: Partial<WidgetConfig>
): Promise<WidgetConfig | null> {
  const entries = Object.entries(patch).filter(([key]) => key in PATCHABLE_FIELDS);
  if (entries.length === 0) {
    const { rows } = await query<WidgetConfigRow>(
      `select ${WIDGET_SELECT} from widget_configs wc
       join bots b on b.id = wc.bot_id
       where wc.bot_id = $1 and b.user_id = $2`,
      [botId, userId]
    );
    return rows[0] ? rowToWidgetConfig(rows[0]) : null;
  }

  const setClauses = entries.map(([key], i) => {
    const column = PATCHABLE_FIELDS[key];
    return column === "starter_prompts" ? `${column} = $${i + 3}::jsonb` : `${column} = $${i + 3}`;
  });
  const values = entries.map(([key, value]) => (key === "starterPrompts" ? JSON.stringify(value) : value));

  const { rows } = await query<WidgetConfigRow>(
    `update widget_configs wc set ${setClauses.join(", ")}
     from bots b
     where wc.bot_id = $1 and b.id = wc.bot_id and b.user_id = $2
     returning ${WIDGET_SELECT}`,
    [botId, userId, ...values]
  );
  return rows[0] ? rowToWidgetConfig(rows[0]) : null;
}
