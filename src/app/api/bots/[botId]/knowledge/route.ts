import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/server/dal";
import { createKnowledgeDocForUser } from "@/lib/server/knowledge";
import type { DocSourceType } from "@/lib/dashboard/types";

export async function POST(req: Request, { params }: { params: Promise<{ botId: string }> }) {
  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { botId } = await params;

  let body: { sourceType?: DocSourceType; title?: string; url?: string; sizeBytes?: number; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  if (body.sourceType !== "file" && body.sourceType !== "link" && body.sourceType !== "text") {
    return NextResponse.json({ error: "Некорректный sourceType" }, { status: 400 });
  }
  const title = (body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Не указан title" }, { status: 400 });
  }

  const document = await createKnowledgeDocForUser(userId, botId, {
    sourceType: body.sourceType,
    title,
    url: body.url,
    sizeBytes: body.sizeBytes,
    content: body.content,
  });
  if (!document) {
    return NextResponse.json({ error: "Бот не найден" }, { status: 404 });
  }
  return NextResponse.json({ document });
}
