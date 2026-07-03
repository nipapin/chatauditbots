"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { createUser, findUserByEmail } from "@/lib/server/users";
import { createSession, deleteSession } from "@/lib/server/session";

export interface AuthActionState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(_prevState: AuthActionState | undefined, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!EMAIL_RE.test(email)) {
    return { error: "Введите корректный email." };
  }
  if (password.length < 8) {
    return { error: "Пароль должен быть не короче 8 символов." };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "Пользователь с таким email уже зарегистрирован." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(email, passwordHash);
  await createSession(user.id);
  redirect("/");
}

export async function loginAction(_prevState: AuthActionState | undefined, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "Неверный email или пароль." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Неверный email или пароль." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
