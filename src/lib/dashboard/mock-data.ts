import type {
  Bot,
  Dialog,
  KnowledgeDocument,
  Lead,
  NotificationSettings,
  WidgetConfig,
} from "./types";

function daysAgo(days: number, hour = 12, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const MOCK_BOTS: Bot[] = [
  {
    id: "bot_shop",
    name: "Консультант интернет-магазина",
    avatarUrl: null,
    status: "active",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2),
    welcomeMessage: "Здравствуйте! Я помогу подобрать товар и отвечу на вопросы по заказу.",
    systemPrompt:
      "Ты — консультант интернет-магазина бытовой техники. Отвечай кратко и по делу, уточняй параметры перед рекомендацией товара.",
    temperature: 0.6,
    maxTokens: 600,
    topP: 0.9,
    messageLimit: 40,
    planTier: "pro",
  },
  {
    id: "bot_clinic",
    name: "Ассистент стоматологии",
    avatarUrl: null,
    status: "active",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
    welcomeMessage: "Добрый день! Подскажу по услугам клиники и помогу записаться на приём.",
    systemPrompt:
      "Ты — ассистент стоматологической клиники. Помогай с записью на приём, отвечай на вопросы о врачах и услугах.",
    temperature: 0.5,
    maxTokens: 500,
    topP: 0.9,
    messageLimit: null,
    planTier: "enterprise",
  },
  {
    id: "bot_draft",
    name: "Бот для юр. услуг (черновик)",
    avatarUrl: null,
    status: "draft",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    welcomeMessage: "Здравствуйте! Чем могу помочь?",
    systemPrompt: "Ты — консультант юридической компании.",
    temperature: 0.7,
    maxTokens: 500,
    topP: 1,
    messageLimit: 20,
    planTier: "free",
  },
];

export const MOCK_WIDGET_CONFIGS: WidgetConfig[] = [
  {
    botId: "bot_shop",
    primaryColor: "#3b6d11",
    accentColor: "#eaf3de",
    logoUrl: null,
    companyName: "ТехноДом",
    position: "bottom-right",
    buttonSize: "md",
    buttonStyle: "round",
    starterPrompts: ["Подобрать холодильник", "Статус моего заказа", "Условия доставки"],
  },
  {
    botId: "bot_clinic",
    primaryColor: "#185fa5",
    accentColor: "#e6f1fb",
    logoUrl: null,
    companyName: "Клиника «Улыбка»",
    position: "bottom-right",
    buttonSize: "lg",
    buttonStyle: "pill-with-label",
    starterPrompts: ["Записаться на приём", "Стоимость лечения", "Часы работы"],
  },
  {
    botId: "bot_draft",
    primaryColor: "#854f0b",
    accentColor: "#faeeda",
    logoUrl: null,
    companyName: "ЮрПартнёр",
    position: "bottom-left",
    buttonSize: "sm",
    buttonStyle: "rounded-square",
    starterPrompts: ["Бесплатная консультация"],
  },
];

export const MOCK_KNOWLEDGE: KnowledgeDocument[] = [
  {
    id: "doc_1",
    botId: "bot_shop",
    sourceType: "file",
    title: "Каталог_техники_2026.pdf",
    sizeBytes: 2_400_000,
    status: "ready",
    addedAt: daysAgo(20),
  },
  {
    id: "doc_2",
    botId: "bot_shop",
    sourceType: "link",
    title: "Условия доставки и возврата",
    url: "https://tehnodom.example.com/delivery",
    status: "ready",
    addedAt: daysAgo(18),
  },
  {
    id: "doc_3",
    botId: "bot_shop",
    sourceType: "file",
    title: "Прайс-лист_апрель.xlsx",
    sizeBytes: 340_000,
    status: "error",
    errorMessage: "Не удалось распознать таблицу — проверьте формат файла",
    addedAt: daysAgo(4),
  },
  {
    id: "doc_4",
    botId: "bot_clinic",
    sourceType: "link",
    title: "Прайс на услуги клиники",
    url: "https://ulybka-clinic.example.com/prices",
    status: "ready",
    addedAt: daysAgo(25),
  },
  {
    id: "doc_5",
    botId: "bot_clinic",
    sourceType: "file",
    title: "Врачи_и_специализации.docx",
    sizeBytes: 180_000,
    status: "processing",
    addedAt: daysAgo(0),
  },
];

function dialog(
  id: string,
  botId: string,
  daysBack: number,
  hour: number,
  messages: { role: "visitor" | "bot" | "operator"; text: string; minuteOffset: number }[],
  visitor: Dialog["visitor"],
  leadCaptured: boolean
): Dialog {
  const startedAt = daysAgo(daysBack, hour, 0);
  const startMs = new Date(startedAt).getTime();
  const fullMessages = messages.map((m, i) => ({
    id: `${id}_m${i}`,
    role: m.role,
    text: m.text,
    timestamp: new Date(startMs + m.minuteOffset * 60_000).toISOString(),
  }));
  const lastOffset = messages[messages.length - 1]?.minuteOffset ?? 0;
  return {
    id,
    botId,
    startedAt,
    endedAt: new Date(startMs + lastOffset * 60_000).toISOString(),
    messages: fullMessages,
    visitor,
    messageCount: fullMessages.length,
    durationSec: lastOffset * 60,
    leadCaptured,
  };
}

export const MOCK_DIALOGS: Dialog[] = [
  dialog(
    "dlg_1",
    "bot_shop",
    1,
    10,
    [
      { role: "visitor", text: "Здравствуйте, ищу холодильник до 60 000 ₽", minuteOffset: 0 },
      { role: "bot", text: "Добрый день! Уточните, какой объём и сколько отделений нужно?", minuteOffset: 0.3 },
      { role: "visitor", text: "Двухкамерный, литров на 300", minuteOffset: 1 },
      { role: "bot", text: "Подойдёт модель Bosch KGN39 — 320 л, No Frost, 54 900 ₽. Показать характеристики?", minuteOffset: 1.5 },
      { role: "visitor", text: "Да, и оставлю контакты для заказа", minuteOffset: 3 },
    ],
    { name: "Дмитрий", phone: "+7 900 111-22-33", location: "Москва, RU", pageUrl: "/catalog/fridges" },
    true
  ),
  dialog(
    "dlg_2",
    "bot_shop",
    3,
    14,
    [
      { role: "visitor", text: "Какая гарантия на стиральные машины?", minuteOffset: 0 },
      { role: "bot", text: "Гарантия производителя — 2 года, продлённая — до 5 лет за отдельную плату.", minuteOffset: 0.4 },
      { role: "visitor", text: "Спасибо, понятно", minuteOffset: 1.2 },
    ],
    { location: "Санкт-Петербург, RU", pageUrl: "/catalog/washers" },
    false
  ),
  dialog(
    "dlg_3",
    "bot_shop",
    6,
    19,
    [
      { role: "visitor", text: "Где мой заказ №4521?", minuteOffset: 0 },
      { role: "bot", text: "Секунду, уточняю статус... Заказ передан в доставку, ожидается завтра до 18:00.", minuteOffset: 0.5 },
      { role: "visitor", text: "Отлично, спасибо!", minuteOffset: 1 },
    ],
    { name: "Ирина", email: "irina@example.com", pageUrl: "/orders/4521" },
    false
  ),
  dialog(
    "dlg_4",
    "bot_clinic",
    2,
    9,
    [
      { role: "visitor", text: "Здравствуйте, хочу записаться к детскому стоматологу", minuteOffset: 0 },
      { role: "bot", text: "Подскажите удобную дату и возраст ребёнка — подберу врача и время.", minuteOffset: 0.3 },
      { role: "visitor", text: "В пятницу, ребёнку 6 лет", minuteOffset: 2 },
      { role: "bot", text: "Есть слот у Ковалевой А.С. в пятницу в 15:30. Записать и оставите телефон для подтверждения?", minuteOffset: 2.6 },
      { role: "visitor", text: "Да, +7 911 222-33-44", minuteOffset: 3.5 },
    ],
    { name: "Анна", phone: "+7 911 222-33-44", location: "Москва, RU" },
    true
  ),
  dialog(
    "dlg_5",
    "bot_clinic",
    5,
    17,
    [
      { role: "visitor", text: "Сколько стоит чистка зубов?", minuteOffset: 0 },
      { role: "bot", text: "Ультразвуковая чистка — 3 500 ₽, с Air Flow — 4 800 ₽.", minuteOffset: 0.4 },
      { role: "visitor", text: "Поняла, спасибо", minuteOffset: 1 },
    ],
    { location: "Москва, RU" },
    false
  ),
  dialog(
    "dlg_6",
    "bot_clinic",
    9,
    11,
    [
      { role: "visitor", text: "Работаете по выходным?", minuteOffset: 0 },
      { role: "bot", text: "Да, по субботам с 10:00 до 16:00, воскресенье — выходной.", minuteOffset: 0.3 },
    ],
    null,
    false
  ),
];

export const MOCK_LEADS: Lead[] = [
  {
    id: "lead_1",
    botId: "bot_shop",
    dialogId: "dlg_1",
    name: "Дмитрий",
    phone: "+7 900 111-22-33",
    capturedAt: daysAgo(1, 10, 5),
    note: "Интересует Bosch KGN39, готов оформить заказ",
  },
  {
    id: "lead_2",
    botId: "bot_clinic",
    dialogId: "dlg_4",
    name: "Анна",
    phone: "+7 911 222-33-44",
    capturedAt: daysAgo(2, 9, 4),
    note: "Запись к детскому стоматологу на пятницу 15:30",
  },
];

export const MOCK_NOTIFICATION_SETTINGS: NotificationSettings[] = [
  { botId: "bot_shop", emailOnNewLead: true, notifyEmail: "sales@tehnodom.example.com" },
  { botId: "bot_clinic", emailOnNewLead: true, notifyEmail: "reception@ulybka-clinic.example.com", webhookUrl: "" },
  { botId: "bot_draft", emailOnNewLead: false, notifyEmail: "" },
];
