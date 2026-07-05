import "server-only";
import { query } from "./db";
import type {
  WidgetButtonSize,
  WidgetButtonStyle,
  WidgetConfig,
  WidgetPosition,
  WidgetTheme,
} from "@/lib/dashboard/types";

interface WidgetConfigRow {
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
}

function rowToWidgetConfig(row: WidgetConfigRow): WidgetConfig {
  return {
    botId: row.bot_id,
    primaryColorLight: row.primary_color_light,
    botBubbleColorLight: row.bot_bubble_color_light,
    userBubbleColorLight: row.user_bubble_color_light,
    backgroundColorLight: row.background_color_light,
    primaryColorDark: row.primary_color_dark,
    botBubbleColorDark: row.bot_bubble_color_dark,
    userBubbleColorDark: row.user_bubble_color_dark,
    backgroundColorDark: row.background_color_dark,
    theme: row.theme as WidgetTheme,
    subtitle: row.subtitle,
    companyName: row.company_name,
    position: row.position as WidgetPosition,
    buttonSize: row.button_size as WidgetButtonSize,
    buttonStyle: row.button_style as WidgetButtonStyle,
    starterPrompts: row.starter_prompts,
  };
}

const WIDGET_SELECT = `wc.bot_id, wc.primary_color_light, wc.bot_bubble_color_light, wc.user_bubble_color_light, wc.background_color_light, wc.primary_color_dark, wc.bot_bubble_color_dark, wc.user_bubble_color_dark, wc.background_color_dark, wc.theme, wc.subtitle, wc.company_name, wc.position, wc.button_size, wc.button_style, wc.starter_prompts`;

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
  primaryColorLight: "primary_color_light",
  botBubbleColorLight: "bot_bubble_color_light",
  userBubbleColorLight: "user_bubble_color_light",
  backgroundColorLight: "background_color_light",
  primaryColorDark: "primary_color_dark",
  botBubbleColorDark: "bot_bubble_color_dark",
  userBubbleColorDark: "user_bubble_color_dark",
  backgroundColorDark: "background_color_dark",
  theme: "theme",
  subtitle: "subtitle",
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
