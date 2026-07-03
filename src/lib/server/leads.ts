import "server-only";
import { query } from "./db";
import type { Lead } from "@/lib/dashboard/types";

interface LeadRow {
  id: string;
  bot_id: string;
  dialog_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  captured_at: Date;
  note: string | null;
}

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    botId: row.bot_id,
    dialogId: row.dialog_id ?? "",
    name: row.name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    capturedAt: row.captured_at.toISOString(),
    note: row.note ?? undefined,
  };
}

export async function listLeadsForUser(userId: string): Promise<Lead[]> {
  const { rows } = await query<LeadRow>(
    `select l.id, l.bot_id, l.dialog_id, l.name, l.email, l.phone, l.captured_at, l.note
     from leads l
     join bots b on b.id = l.bot_id
     where b.user_id = $1
     order by l.captured_at desc`,
    [userId]
  );
  return rows.map(rowToLead);
}
