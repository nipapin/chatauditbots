import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/server/dal";
import { updateWidgetConfigForUser } from "@/lib/server/widgetConfigs";

export async function PATCH(req: Request, { params }: { params: Promise<{ botId: string }> }) {
  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { botId } = await params;

  let patch: Record<string, unknown>;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  const widgetConfig = await updateWidgetConfigForUser(userId, botId, patch);
  if (!widgetConfig) {
    return NextResponse.json({ error: "Бот не найден" }, { status: 404 });
  }
  return NextResponse.json({ widgetConfig });
}
