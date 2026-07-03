import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/server/dal";
import { deleteKnowledgeDocForUser, updateKnowledgeDocStatusForUser } from "@/lib/server/knowledge";
import type { DocStatus } from "@/lib/dashboard/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ docId: string }> }) {
  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { docId } = await params;

  let body: { status?: DocStatus };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }
  if (!body.status) {
    return NextResponse.json({ error: "Не указан status" }, { status: 400 });
  }

  await updateKnowledgeDocStatusForUser(userId, docId, body.status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ docId: string }> }) {
  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { docId } = await params;
  await deleteKnowledgeDocForUser(userId, docId);
  return NextResponse.json({ ok: true });
}
