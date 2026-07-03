import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/server/dal";
import { updateNotificationSettingsForUser } from "@/lib/server/notificationSettings";

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

  const notificationSettings = await updateNotificationSettingsForUser(userId, botId, patch);
  if (!notificationSettings) {
    return NextResponse.json({ error: "Бот не найден" }, { status: 404 });
  }
  return NextResponse.json({ notificationSettings });
}
