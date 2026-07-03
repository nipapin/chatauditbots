import "server-only";
import { query } from "./db";
import type { Dialog, DialogMessage, VisitorInfo } from "@/lib/dashboard/types";

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
  };
}

export async function listDialogsForUser(userId: string): Promise<Dialog[]> {
  const { rows } = await query<DialogRow>(
    `select d.id, d.bot_id, d.started_at, d.ended_at, d.messages, d.visitor, d.message_count, d.duration_sec, d.lead_captured
     from dialogs d
     join bots b on b.id = d.bot_id
     where b.user_id = $1
     order by d.started_at desc`,
    [userId]
  );
  return rows.map(rowToDialog);
}
