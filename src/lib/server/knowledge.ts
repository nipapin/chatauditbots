import "server-only";
import { query } from "./db";
import type { DocSourceType, DocStatus, KnowledgeDocument } from "@/lib/dashboard/types";

interface KnowledgeRow {
  id: string;
  bot_id: string;
  source_type: DocSourceType;
  title: string;
  url: string | null;
  size_bytes: string | null;
  status: DocStatus;
  error_message: string | null;
  added_at: Date;
}

function rowToDoc(row: KnowledgeRow): KnowledgeDocument {
  return {
    id: row.id,
    botId: row.bot_id,
    sourceType: row.source_type,
    title: row.title,
    url: row.url ?? undefined,
    sizeBytes: row.size_bytes !== null ? Number(row.size_bytes) : undefined,
    status: row.status,
    errorMessage: row.error_message ?? undefined,
    addedAt: row.added_at.toISOString(),
  };
}

const DOC_COLUMNS = `id, bot_id, source_type, title, url, size_bytes, status, error_message, added_at`;

export async function listKnowledgeForUser(userId: string): Promise<KnowledgeDocument[]> {
  const { rows } = await query<KnowledgeRow>(
    `select kd.id, kd.bot_id, kd.source_type, kd.title, kd.url, kd.size_bytes, kd.status, kd.error_message, kd.added_at
     from knowledge_documents kd
     join bots b on b.id = kd.bot_id
     where b.user_id = $1
     order by kd.added_at desc`,
    [userId]
  );
  return rows.map(rowToDoc);
}

export async function createKnowledgeDocForUser(
  userId: string,
  botId: string,
  input: { sourceType: DocSourceType; title: string; url?: string; sizeBytes?: number }
): Promise<KnowledgeDocument | null> {
  const { rows: botRows } = await query("select id from bots where id = $1 and user_id = $2", [botId, userId]);
  if (botRows.length === 0) return null;

  const { rows } = await query<KnowledgeRow>(
    `insert into knowledge_documents (bot_id, source_type, title, url, size_bytes, status)
     values ($1, $2, $3, $4, $5, 'processing')
     returning ${DOC_COLUMNS}`,
    [botId, input.sourceType, input.title, input.url ?? null, input.sizeBytes ?? null]
  );
  return rowToDoc(rows[0]);
}

export async function updateKnowledgeDocStatusForUser(
  userId: string,
  docId: string,
  status: DocStatus
): Promise<void> {
  await query(
    `update knowledge_documents kd set status = $1
     from bots b
     where kd.id = $2 and b.id = kd.bot_id and b.user_id = $3`,
    [status, docId, userId]
  );
}

export async function deleteKnowledgeDocForUser(userId: string, docId: string): Promise<void> {
  await query(
    `delete from knowledge_documents kd
     using bots b
     where kd.id = $1 and b.id = kd.bot_id and b.user_id = $2`,
    [docId, userId]
  );
}
