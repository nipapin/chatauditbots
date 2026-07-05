import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/server/dal";
import { createMockDialogsForBot, deleteMockDialogsForBot } from "@/lib/server/dialogs";

/** Только для локальной разработки — не даёт засорить реальную БД тестовыми диалогами. */
function assertDevMode(): NextResponse | null {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Доступно только в dev-режиме" }, { status: 403 });
  }
  return null;
}

export async function POST(req: Request, { params }: { params: Promise<{ botId: string }> }) {
  const devError = assertDevMode();
  if (devError) return devError;

  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { botId } = await params;

  const { dialogs, leads } = await createMockDialogsForBot(userId, botId);
  return NextResponse.json({ dialogs, leads });
}

/** Удаляет все ранее насозданные мокап-диалоги для бота (is_mock = true), чтобы dev-данные не копились. */
export async function DELETE(req: Request, { params }: { params: Promise<{ botId: string }> }) {
  const devError = assertDevMode();
  if (devError) return devError;

  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { botId } = await params;

  const { deletedDialogIds } = await deleteMockDialogsForBot(userId, botId);
  return NextResponse.json({ deletedDialogIds });
}
