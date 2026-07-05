import { NextResponse } from "next/server";
import { extractText, getAnthropicClient, resolveModel } from "@/lib/server/anthropic";
import { requireApiUserId } from "@/lib/server/dal";

function normalizeHex(raw: string): string | null {
  const value = raw.trim();
  const short = value.match(/^#([0-9a-f]{3})$/i);
  if (short) {
    const [r, g, b] = short[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}

/** Реальный брендовый цвет сайта — из мета-тегов, которыми сайты сами объявляют свой цвет. */
function extractThemeColor(html: string): string | null {
  const candidates = [
    html.match(/<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i),
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']theme-color["']/i),
    html.match(/<meta[^>]+name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i),
  ];
  for (const match of candidates) {
    const hex = match && normalizeHex(match[1]);
    if (hex) return hex;
  }
  return null;
}

/** Переводит hex/rgb()/rgba() из CSS-значения в нормализованный #rrggbb. */
function normalizeCssColor(raw: string): string | null {
  const value = raw.trim().replace(/\s*!important$/i, "");
  const hex = normalizeHex(value);
  if (hex) return hex;
  const rgbMatch = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `#${[r, g, b].map((c) => Math.min(255, Number(c)).toString(16).padStart(2, "0")).join("")}`;
  }
  return null;
}

// Порядок приоритета: сначала явные "главный/брендовый" токены, потом --accent —
// так называют акцентный цвет чаще всего, если primary/brand не заданы.
const BRAND_VAR_PATTERNS = [
  /--(?:color-)?primary(?:-color)?\s*:\s*([^;]+)/i,
  /--(?:color-)?brand(?:-color)?\s*:\s*([^;]+)/i,
  /--main-color\s*:\s*([^;]+)/i,
  /--theme-color\s*:\s*([^;]+)/i,
  /--(?:color-)?accent(?:-color)?\s*:\s*([^;]+)/i,
];

/** Ищет брендовый цвет в CSS-переменных (--primary/--brand/--accent и т.п.). */
function extractCssColorToken(css: string): string | null {
  for (const pattern of BRAND_VAR_PATTERNS) {
    const match = css.match(pattern);
    const color = match && normalizeCssColor(match[1]);
    if (color) return color;
  }
  return null;
}

/** Содержимое всех инлайновых <style> блоков страницы. */
function extractInlineStyleBlocks(html: string): string {
  const blocks: string[] = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) blocks.push(match[1]);
  return blocks.join("\n");
}

/** Первая подключённая таблица стилей того же сайта (пропускает шрифтовые CDN). */
function findFirstStylesheetUrl(html: string, baseUrl: URL): URL | null {
  const linkTagRegex = /<link\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkTagRegex.exec(html)) !== null) {
    const tag = match[0];
    if (!/rel=["']stylesheet["']/i.test(tag)) continue;
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(hrefMatch[1])) continue;
    try {
      const absolute = new URL(hrefMatch[1], baseUrl);
      if (isSameSite(absolute.hostname, baseUrl.hostname)) return absolute;
    } catch {
      continue;
    }
  }
  return null;
}

/** Светлый тон того же цвета — для фона пузыря сообщений виджета. */
function lightenHex(hex: string, amount = 0.87): string {
  const num = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  const r = mix((num >> 16) & 0xff);
  const g = mix((num >> 8) & 0xff);
  const b = mix(num & 0xff);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export type PageCategory = "catalog" | "faq" | "about" | "contacts";

export interface DiscoveredPage {
  category: PageCategory;
  label: string;
  url: string;
  title: string;
}

const CATEGORY_LABELS: Record<PageCategory, string> = {
  catalog: "Каталог / товары",
  faq: "FAQ",
  about: "О компании",
  contacts: "Контакты",
};

// Сегменты URL-пути (самые распространённые конвенции урлов) — самый надёжный сигнал.
const PATH_KEYWORDS: Record<PageCategory, string[]> = {
  catalog: ["catalog", "catalogue", "shop", "store", "products", "product", "pricing", "price", "prices", "services", "service", "каталог", "товары", "магазин", "услуги", "прайс"],
  faq: ["faq", "questions", "help", "faqs"],
  about: ["about", "about-us", "aboutus", "company", "o-nas", "onas", "o-kompanii", "o-firme"],
  contacts: ["contact", "contacts", "kontakty", "kontakt"],
};

// Точный (после trim/lowercase) текст ссылки — тоже сильный сигнал (пункты меню/футера).
const EXACT_TEXT_KEYWORDS: Record<PageCategory, string[]> = {
  catalog: ["каталог", "товары", "магазин", "услуги", "прайс", "прайс-лист", "цены", "catalog", "shop", "products", "pricing", "price list", "services"],
  faq: ["faq", "вопросы", "частые вопросы", "часто задаваемые вопросы", "вопросы и ответы", "questions", "help"],
  about: ["о нас", "о компании", "about", "about us", "компания", "о фирме"],
  contacts: ["контакты", "contact", "contacts", "связаться с нами", "как нас найти", "contact us"],
};

interface Candidate {
  score: number;
  url: string;
  title: string;
}

/** Тот же сайт — включая поддомены (support.example.com, help.example.com и т.п.). */
function isSameSite(hostname: string, baseHostname: string): boolean {
  const strip = (h: string) => h.replace(/^www\./, "");
  const a = strip(hostname);
  const b = strip(baseHostname);
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

function scoreCandidate(pathname: string, text: string, category: PageCategory): number {
  const segments = pathname.toLowerCase().split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "";
  const normalizedText = text.toLowerCase().trim();
  const wordCount = normalizedText ? normalizedText.split(/\s+/).length : 0;

  let score = 0;
  if (PATH_KEYWORDS[category].includes(lastSegment)) score = Math.max(score, 3);
  else if (segments.some((s) => PATH_KEYWORDS[category].includes(s))) score = Math.max(score, 2.5);

  if (EXACT_TEXT_KEYWORDS[category].includes(normalizedText)) {
    score = Math.max(score, 2.8);
  } else if (wordCount > 0 && wordCount <= 3) {
    // Короткие подписи ссылок ("Contact GitHub", "О компании ООО") — сверяем по целому слову,
    // чтобы не подхватывать длинные маркетинговые фразы вроде "Learn about GitHub Code Security".
    const hasWholeWordMatch = EXACT_TEXT_KEYWORDS[category].some(
      (keyword) => !keyword.includes(" ") && new RegExp(`\\b${keyword}\\b`, "i").test(normalizedText)
    );
    if (hasWholeWordMatch) score = Math.max(score, 2);
  }

  return score;
}

/** Ищет в HTML главной страницы ссылки на каталог/FAQ/о компании/контакты того же домена. */
function discoverSitePages(html: string, baseUrl: URL): DiscoveredPage[] {
  const linkRegex = /<a\b[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const best = new Map<PageCategory, Candidate>();
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    let absolute: URL;
    try {
      absolute = new URL(match[1], baseUrl);
    } catch {
      continue;
    }
    if (!isSameSite(absolute.hostname, baseUrl.hostname) || !/^https?:$/.test(absolute.protocol)) continue;

    const anchorText = match[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    for (const category of Object.keys(PATH_KEYWORDS) as PageCategory[]) {
      const score = scoreCandidate(absolute.pathname, anchorText, category);
      if (score === 0) continue;
      const current = best.get(category);
      if (!current || score > current.score) {
        best.set(category, { score, url: absolute.toString(), title: anchorText || CATEGORY_LABELS[category] });
      }
    }
  }

  return [...best.entries()].map(([category, candidate]) => ({
    category,
    label: CATEGORY_LABELS[category],
    url: candidate.url,
    title: candidate.title,
  }));
}

function extractReadableText(html: string): { title: string; description: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const strippedText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    description: descMatch ? descMatch[1].trim() : "",
    text: strippedText.slice(0, 6000),
  };
}

export async function POST(req: Request) {
  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  const rawUrl = (body.url || "").trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "Не указан URL" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json({ error: "Некорректный URL" }, { status: 400 });
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ChatAuditBot/1.0; +https://chataudit.ru)" },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return NextResponse.json({ error: `Сайт ответил с ошибкой ${res.status}` }, { status: 502 });
    }
    // Кап большой, а не маленький: ссылки на FAQ/о компании/контакты обычно
    // лежат в футере, то есть в конце документа — агрессивная обрезка их отрезает.
    // Для промпта Claude всё равно уходит только text.slice(0, 6000) из extractReadableText.
    html = (await res.text()).slice(0, 2_000_000);
  } catch {
    return NextResponse.json(
      { error: "Не удалось загрузить сайт — он недоступен или блокирует автоматические запросы" },
      { status: 502 }
    );
  }

  const { title, description, text } = extractReadableText(html);
  const discoveredPages = discoverSitePages(html, targetUrl);

  // Порядок поиска реального цвета сайта: meta theme-color -> CSS-переменные
  // в инлайновых <style> -> CSS-переменные во внешнем CSS-файле. Первое, что
  // нашлось, и используем; если ничего — клиент откатится на хэш-палитру.
  let themeColor = extractThemeColor(html);
  if (!themeColor) {
    themeColor = extractCssColorToken(extractInlineStyleBlocks(html));
  }
  if (!themeColor) {
    const stylesheetUrl = findFirstStylesheetUrl(html, targetUrl);
    if (stylesheetUrl) {
      try {
        const cssRes = await fetch(stylesheetUrl.toString(), {
          signal: AbortSignal.timeout(5000),
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ChatAuditBot/1.0; +https://chataudit.ru)" },
        });
        if (cssRes.ok) {
          const cssText = (await cssRes.text()).slice(0, 500_000);
          themeColor = extractCssColorToken(cssText);
        }
      } catch {
        // Необязательный источник — молча продолжаем без него.
      }
    }
  }

  let client;
  try {
    client = getAnthropicClient();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const prompt = `Ты помогаешь настроить чат-бота поддержки клиентов для сайта.

URL: ${targetUrl.hostname}
Title: ${title || "—"}
Meta description: ${description || "—"}
Текст главной страницы (фрагмент): ${text || "—"}

Определи, чем занимается компания, и предложи:
1. companyName — короткое название компании (как в шапке сайта)
2. welcomeMessage — дружелюбное приветственное сообщение чат-бота на русском языке (1-2 предложения), которое бот покажет первым посетителю сайта
3. systemPrompt — системная инструкция для ИИ-ассистента на русском языке (3-5 предложений): роль, тон общения, что делать если не знает ответа

Ответь СТРОГО в формате JSON без пояснений и markdown-разметки:
{"companyName": "...", "welcomeMessage": "...", "systemPrompt": "..."}`;

  try {
    // temperature намеренно не передаётся: часть моделей Claude (например,
    // claude-sonnet-5) отвечает 400 invalid_request_error на этот параметр.
    const response = await client.messages.create({
      model: resolveModel(),
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = extractText(response.content);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Модель не вернула JSON");

    const parsed = JSON.parse(jsonMatch[0]) as {
      companyName?: string;
      welcomeMessage?: string;
      systemPrompt?: string;
    };

    if (!parsed.welcomeMessage || !parsed.systemPrompt) {
      throw new Error("Неполный ответ модели");
    }

    return NextResponse.json({
      companyName: String(parsed.companyName || title || targetUrl.hostname),
      welcomeMessage: String(parsed.welcomeMessage),
      systemPrompt: String(parsed.systemPrompt),
      // Реальный цвет сайта, если он объявлен через <meta name="theme-color">.
      // Если сайт его не указывает — null, и клиент использует цвет по хэшу домена как раньше.
      primaryColor: themeColor,
      botBubbleColor: themeColor ? lightenHex(themeColor) : null,
      discoveredPages,
    });
  } catch (err) {
    console.error("Anthropic analyze-site error", err);
    return NextResponse.json({ error: "Не удалось сгенерировать текст через Claude" }, { status: 502 });
  }
}
