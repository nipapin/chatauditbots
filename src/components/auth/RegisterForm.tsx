"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/app/actions/auth";
import { PasswordField } from "./PasswordField";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  // Контролируемые поля — иначе React сбрасывает форму после каждого вызова
  // action (в том числе при ошибке), и введённые данные приходится вводить заново.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="dash-card" style={{ width: 360 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Регистрация в ChatAudit</h1>
      <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", marginBottom: 20 }}>
        Создайте аккаунт, чтобы настраивать своих чат-ботов.
      </p>

      <div className="dash-field">
        <label className="dash-label" htmlFor="register-email">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          className="dash-input"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <PasswordField
        id="register-password"
        label="Пароль"
        value={password}
        onChange={setPassword}
        required
        minLength={8}
        hint="Не короче 8 символов."
      />

      {state?.error && (
        <div style={{ fontSize: 12, color: "var(--dash-danger-fg)", marginBottom: 12 }}>{state.error}</div>
      )}

      <button type="submit" className="dash-btn dash-btn-primary" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Создаём аккаунт..." : "Зарегистрироваться"}
      </button>

      <div style={{ fontSize: 12, color: "var(--dash-text-tertiary)", marginTop: 16, textAlign: "center" }}>
        Уже есть аккаунт? <Link href="/login">Войти</Link>
      </div>
    </form>
  );
}
