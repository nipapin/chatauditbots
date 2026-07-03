import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/server/dal";
import { createBotForUser } from "@/lib/server/bots";

export async function POST(req: Request) {
  const userId = await requireApiUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Не указано название бота" }, { status: 400 });
  }

  const result = await createBotForUser(userId, name);
  return NextResponse.json(result);
}
