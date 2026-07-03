import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionUserId } from "./session";

export const verifySession = cache(async (): Promise<{ userId: string }> => {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }
  return { userId };
});

/** Для Route Handlers: не редиректит, а возвращает null — вызывающий код сам решает, что ответить (обычно 401). */
export async function requireApiUserId(): Promise<string | null> {
  return getSessionUserId();
}
