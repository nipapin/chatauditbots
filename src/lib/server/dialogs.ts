import "server-only";
import { randomUUID } from "crypto";
import { query } from "./db";
import type { Dialog, DialogMessage, Lead, VisitorInfo } from "@/lib/dashboard/types";

interface DialogRow {
  id: string;
  bot_id: string;
  started_at: Date;
  ended_at: Date | null;
  messages: DialogMessage[];
  visitor: VisitorInfo | null;
  message_count: number;
  duration_sec: number | null;
  lead_captured: boolean;
  summary: string | null;
  is_mock: boolean;
}

function rowToDialog(row: DialogRow): Dialog {
  return {
    id: row.id,
    botId: row.bot_id,
    startedAt: row.started_at.toISOString(),
    endedAt: row.ended_at ? row.ended_at.toISOString() : null,
    messages: row.messages,
    visitor: row.visitor,
    messageCount: row.message_count,
    durationSec: row.duration_sec,
    leadCaptured: row.lead_captured,
    summary: row.summary,
    isMock: row.is_mock,
  };
}

const DIALOG_COLUMNS = `id, bot_id, started_at, ended_at, messages, visitor, message_count, duration_sec, lead_captured, summary, is_mock`;

export async function listDialogsForUser(userId: string): Promise<Dialog[]> {
  const { rows } = await query<DialogRow>(
    `select ${DIALOG_COLUMNS.split(", ").map((c) => `d.${c}`).join(", ")}
     from dialogs d
     join bots b on b.id = d.bot_id
     where b.user_id = $1
     order by d.started_at desc`,
    [userId]
  );
  return rows.map(rowToDialog);
}

export async function getDialogForUser(userId: string, botId: string, dialogId: string): Promise<Dialog | null> {
  const { rows } = await query<DialogRow>(
    `select ${DIALOG_COLUMNS.split(", ").map((c) => `d.${c}`).join(", ")}
     from dialogs d
     join bots b on b.id = d.bot_id
     where d.id = $1 and d.bot_id = $2 and b.user_id = $3`,
    [dialogId, botId, userId]
  );
  return rows[0] ? rowToDialog(rows[0]) : null;
}

export async function updateDialogSummaryForUser(
  userId: string,
  botId: string,
  dialogId: string,
  summary: string
): Promise<Dialog | null> {
  const { rows } = await query<DialogRow>(
    `update dialogs d set summary = $1
     from bots b
     where d.id = $2 and d.bot_id = $3 and b.id = d.bot_id and b.user_id = $4
     returning ${DIALOG_COLUMNS.split(", ").map((c) => `d.${c}`).join(", ")}`,
    [summary, dialogId, botId, userId]
  );
  return rows[0] ? rowToDialog(rows[0]) : null;
}

interface MockTemplate {
  exchanges: [string, string][];
  visitor: VisitorInfo | null;
  lead: { name?: string; email?: string; phone?: string; note: string } | null;
}

const MOCK_TEMPLATES: MockTemplate[] = [
  {
    exchanges: [
      ["Здравствуйте! Сколько стоит доставка по Москве?", "Доставка по Москве бесплатна при заказе от 3000 ₽, иначе 300 ₽. Курьер привозит на следующий день."],
      ["А в другие города?", "По России доставка транспортными компаниями, 3-7 дней, стоимость зависит от региона — от 350 ₽."],
    ],
    visitor: { name: "Ирина Соколова", email: "irina.sokolova@example.com", location: "Москва", pageUrl: "/catalog/dostavka" },
    lead: null,
  },
  {
    exchanges: [
      ["Добрый день, товар из заказа №1042 не подошёл, как оформить возврат?", "Здравствуйте! Возврат возможен в течение 14 дней. Пришлите, пожалуйста, номер заказа и укажите причину — оформлю обмен или возврат средств."],
      ["Номер заказа 1042, размер не подошёл", "Спасибо, передам менеджеру — он свяжется с вами для уточнения деталей возврата."],
    ],
    visitor: { name: "Дмитрий Волков", phone: "+7 916 220-14-58", location: "Санкт-Петербург" },
    lead: { name: "Дмитрий Волков", phone: "+7 916 220-14-58", note: "Возврат по заказу №1042 — нужно связаться" },
  },
  {
    exchanges: [
      ["Здравствуйте, есть ли в наличии куртка Alpine размер M?", "Добрый день! Да, куртка Alpine в размере M есть в наличии на складе."],
      ["Отлично, а можно забронировать до завтра?", "Да, забронирую на 24 часа. Оставьте, пожалуйста, номер телефона для связи."],
      ["+7 903 555-19-02", "Записал, бронь оформлена до завтра 18:00. Спасибо за обращение!"],
    ],
    visitor: { name: "Анна Петрова", location: "Казань", pageUrl: "/catalog/jackets/alpine" },
    lead: { name: "Анна Петрова", phone: "+7 903 555-19-02", note: "Бронь куртки Alpine, размер M, до завтра 18:00" },
  },
  {
    exchanges: [
      ["Промокод WELCOME10 не применяется на сайте", "Здравствуйте! Промокод действует только на первый заказ и товары не по акции. Проверьте, пожалуйста, состав корзины."],
      ["Там один товар, не по акции", "Странно, попробуйте обновить страницу и ввести код заново — если не поможет, оформлю скидку вручную."],
    ],
    visitor: { email: "user2024@example.com" },
    lead: null,
  },
  {
    exchanges: [
      ["Здравствуйте! Работаете ли вы в выходные?", "Добрый день! Да, служба поддержки работает без выходных с 9:00 до 21:00."],
    ],
    visitor: null,
    lead: null,
  },
  {
    exchanges: [
      ["Хочу оставить заявку на консультацию по подбору товара", "Конечно! Оставьте, пожалуйста, ваше имя и телефон — консультант свяжется с вами в течение часа."],
      ["Сергей, +7 925 111-30-77", "Спасибо, Сергей! Передал заявку консультанту, он позвонит вам в течение часа."],
    ],
    visitor: { name: "Сергей Иванов", phone: "+7 925 111-30-77", location: "Новосибирск" },
    lead: { name: "Сергей Иванов", phone: "+7 925 111-30-77", note: "Заявка на консультацию по подбору товара" },
  },
  {
    exchanges: [
      ["Это не публичная оферта? Я запутался в условиях акции", "Всё верно, расскажу подробнее: акция «-20% на второй товар» действует до конца месяца на весь ассортимент кроме уценки."],
      ["Понял, спасибо", "Пожалуйста! Обращайтесь, если появятся ещё вопросы."],
    ],
    visitor: { location: "Екатеринбург" },
    lead: null,
  },
  {
    exchanges: [
      ["Заказ №998 который день не могу отследить, где посылка?", "Здравствуйте, приношу извинения за неудобства. Проверю статус по номеру 998 и напишу менеджеру логистики."],
      ["Пожалуйста, срочно нужно", "Понимаю, передал заявку с пометкой «срочно», с вами свяжутся в течение часа."],
    ],
    visitor: { name: "Ольга Кузнецова", email: "olga.k@example.com" },
    lead: { name: "Ольга Кузнецова", email: "olga.k@example.com", note: "Жалоба: не могут отследить заказ №998, пометка «срочно»" },
  },
  {
    exchanges: [
      ["Приветствую, а какая гарантия на товары?", "Здравствуйте! Гарантия производителя — 12 месяцев на всю технику, на одежду и обувь — 30 дней на скрытые дефекты."],
    ],
    visitor: { pageUrl: "/faq" },
    lead: null,
  },
  {
    exchanges: [
      ["Можно оплатить при получении?", "Да, доступна оплата наличными или картой курьеру при получении, а также онлайн на сайте."],
      ["Хорошо, тогда оформлю так", "Отлично, если появятся вопросы по заказу — обращайтесь!"],
    ],
    visitor: { name: "Максим Орлов", location: "Ростов-на-Дону" },
    lead: null,
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Насоздаёт правдоподобных тестовых диалогов (и часть — с заявками), чтобы не тестировать список диалогов вручную. */
export async function createMockDialogsForBot(
  userId: string,
  botId: string
): Promise<{ dialogs: Dialog[]; leads: Lead[] }> {
  const { rows: botRows } = await query("select id from bots where id = $1 and user_id = $2", [botId, userId]);
  if (botRows.length === 0) return { dialogs: [], leads: [] };

  const createdDialogs: Dialog[] = [];
  const createdLeads: Lead[] = [];

  for (const template of MOCK_TEMPLATES) {
    const daysAgo = randomInt(0, 21);
    const startedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - randomInt(0, 20) * 60 * 60 * 1000);

    let cursor = new Date(startedAt);
    const messages: DialogMessage[] = [];
    for (const [visitorText, botText] of template.exchanges) {
      cursor = new Date(cursor.getTime() + randomInt(5, 40) * 1000);
      messages.push({ id: randomUUID(), role: "visitor", text: visitorText, timestamp: cursor.toISOString() });
      cursor = new Date(cursor.getTime() + randomInt(15, 90) * 1000);
      messages.push({ id: randomUUID(), role: "bot", text: botText, timestamp: cursor.toISOString() });
    }
    const endedAt = cursor;
    const durationSec = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));

    const { rows } = await query<DialogRow>(
      `insert into dialogs (bot_id, started_at, ended_at, messages, visitor, message_count, duration_sec, lead_captured, is_mock)
       values ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, true)
       returning ${DIALOG_COLUMNS}`,
      [
        botId,
        startedAt.toISOString(),
        endedAt.toISOString(),
        JSON.stringify(messages),
        template.visitor ? JSON.stringify(template.visitor) : null,
        messages.length,
        durationSec,
        Boolean(template.lead),
      ]
    );
    const dialog = rowToDialog(rows[0]);
    createdDialogs.push(dialog);

    if (template.lead) {
      const { rows: leadRows } = await query<{
        id: string;
        bot_id: string;
        dialog_id: string | null;
        name: string | null;
        email: string | null;
        phone: string | null;
        captured_at: Date;
        note: string | null;
      }>(
        `insert into leads (bot_id, dialog_id, name, email, phone, captured_at, note)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning id, bot_id, dialog_id, name, email, phone, captured_at, note`,
        [
          botId,
          dialog.id,
          template.lead.name ?? null,
          template.lead.email ?? null,
          template.lead.phone ?? null,
          endedAt.toISOString(),
          template.lead.note,
        ]
      );
      const leadRow = leadRows[0];
      createdLeads.push({
        id: leadRow.id,
        botId: leadRow.bot_id,
        dialogId: leadRow.dialog_id ?? "",
        name: leadRow.name ?? undefined,
        email: leadRow.email ?? undefined,
        phone: leadRow.phone ?? undefined,
        capturedAt: leadRow.captured_at.toISOString(),
        note: leadRow.note ?? undefined,
      });
    }
  }

  return { dialogs: createdDialogs, leads: createdLeads };
}

/** Удаляет все ранее насозданные мокап-диалоги (и их заявки) для бота — чтобы dev-данные не копились. */
export async function deleteMockDialogsForBot(userId: string, botId: string): Promise<{ deletedDialogIds: string[] }> {
  const { rows: botRows } = await query("select id from bots where id = $1 and user_id = $2", [botId, userId]);
  if (botRows.length === 0) return { deletedDialogIds: [] };

  await query(
    `delete from leads where dialog_id in (select id from dialogs where bot_id = $1 and is_mock = true)`,
    [botId]
  );
  const { rows } = await query<{ id: string }>(
    `delete from dialogs where bot_id = $1 and is_mock = true returning id`,
    [botId]
  );
  return { deletedDialogIds: rows.map((r) => r.id) };
}
