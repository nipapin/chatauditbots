import { BASE_PATH } from "@/lib/basePath";
import type { WidgetConfig } from "./types";

export interface SiteAnalysis {
  hostname: string;
  displayName: string;
  name: string;
  companyName: string;
  welcomeMessage: string;
  systemPrompt: string;
  primaryColor: string;
  botBubbleColor: string;
}

const PALETTE: { primary: string; accent: string }[] = [
  { primary: "#3b6d11", accent: "#eaf3de" },
  { primary: "#185fa5", accent: "#e6f1fb" },
  { primary: "#854f0b", accent: "#faeeda" },
  { primary: "#6c3fa8", accent: "#efe6fb" },
  { primary: "#a32d2d", accent: "#fcebeb" },
];

/** Тёмный тон того же цвета — для тёмной темы виджета. */
function darkenHex(hex: string, amount = 0.7): string {
  const num = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel * (1 - amount));
  const r = mix((num >> 16) & 0xff);
  const g = mix((num >> 8) & 0xff);
  const b = mix(num & 0xff);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Строит полную палитру виджета (4 цвета × светлая/тёмная тема) из одной пары
 * основной+пузырь-бота цветов — чтобы после анализа сайта не оставались
 * незаполненными 6 из 8 цветовых полей WidgetConfig на дефолтных значениях.
 */
export function deriveFullPalette(
  primaryColor: string,
  botBubbleColor: string
): Pick<
  WidgetConfig,
  | "primaryColorLight"
  | "botBubbleColorLight"
  | "userBubbleColorLight"
  | "backgroundColorLight"
  | "primaryColorDark"
  | "botBubbleColorDark"
  | "userBubbleColorDark"
  | "backgroundColorDark"
> {
  return {
    primaryColorLight: primaryColor,
    botBubbleColorLight: botBubbleColor,
    userBubbleColorLight: primaryColor,
    backgroundColorLight: "#ffffff",
    primaryColorDark: primaryColor,
    botBubbleColorDark: darkenHex(botBubbleColor),
    userBubbleColorDark: primaryColor,
    backgroundColorDark: "#1c1c1e",
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function extractHostname(rawUrl: string): string {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  try {
    return new URL(withProtocol).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl.trim().replace(/^www\./, "");
  }
}

/**
 * Детерминированные значения по домену: цветовая палитра виджета и
 * запасной (fallback) текст на случай, если запрос к Claude не удался.
 * Реальный текст (приветствие/промпт/название) должен приходить из
 * fetchAiSiteCopy — эта функция не делает сетевых запросов.
 */
export function analyzeSiteMock(rawUrl: string): SiteAnalysis {
  const hostname = extractHostname(rawUrl);
  const base = hostname.split(".")[0] || hostname;
  const displayName = base.charAt(0).toUpperCase() + base.slice(1);
  const palette = PALETTE[hashString(hostname) % PALETTE.length];

  return {
    hostname,
    displayName,
    name: `Ассистент ${displayName}`,
    companyName: displayName,
    welcomeMessage: `Здравствуйте! Я — виртуальный ассистент сайта ${hostname}. Отвечу на вопросы и помогу выбрать то, что вам нужно.`,
    systemPrompt: `Ты — вежливый консультант сайта ${hostname}. Отвечай кратко и по делу, опирайся на информацию о компании и её товарах или услугах. Если не знаешь точного ответа — предложи оставить контакты для связи с менеджером.`,
    primaryColor: palette.primary,
    botBubbleColor: palette.accent,
  };
}

export type DiscoveredPageCategory = "catalog" | "faq" | "about" | "contacts";

export interface DiscoveredPage {
  category: DiscoveredPageCategory;
  label: string;
  url: string;
  title: string;
}

export interface AiSiteCopy {
  companyName: string;
  welcomeMessage: string;
  systemPrompt: string;
  /** Реальный цвет сайта из <meta name="theme-color">, если сайт его объявляет. */
  primaryColor: string | null;
  botBubbleColor: string | null;
  /** Ссылки на каталог/FAQ/о компании/контакты, найденные на главной странице сайта. */
  discoveredPages: DiscoveredPage[];
}

/** Реальный ИИ-анализ сайта через /api/analyze-site (сервер ходит на сайт и спрашивает Claude). */
export async function fetchAiSiteCopy(url: string): Promise<AiSiteCopy> {
  const res = await fetch(`${BASE_PATH}/api/analyze-site`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Не удалось получить ответ от Claude");
  }
  return data as AiSiteCopy;
}
