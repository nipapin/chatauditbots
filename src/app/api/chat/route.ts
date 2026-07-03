import { NextResponse } from "next/server";
import { extractText, getAnthropicClient, resolveModel } from "@/lib/server/anthropic";
import { requireApiUserId } from "@/lib/server/dal";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  messages?: ChatMessage[];
}

export async function POST(req: Request) {
  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages)
    ? body.messages.slice(-20).filter((m) => m && typeof m.content === "string" && m.content.trim())
    : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "Нет сообщений" }, { status: 400 });
  }

  let client;
  try {
    client = getAnthropicClient();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  try {
    // temperature намеренно не передаётся: часть моделей Claude (например,
    // claude-sonnet-5) отвечает 400 invalid_request_error на этот параметр.
    const response = await client.messages.create({
      model: resolveModel(),
      max_tokens: Math.min(Math.max(Math.round(body.maxTokens ?? 500), 64), 2000),
      system: body.systemPrompt?.trim() || "Ты — вежливый ассистент. Отвечай кратко и по делу.",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = extractText(response.content);
    return NextResponse.json({ reply: text || "…" });
  } catch (err) {
    console.error("Anthropic chat error", err);
    return NextResponse.json({ error: "Не удалось получить ответ от Claude" }, { status: 502 });
  }
}
