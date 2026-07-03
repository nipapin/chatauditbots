"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/app/actions/auth";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

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
        <input id="register-email" name="email" type="email" className="dash-input" required autoFocus />
      </div>

      <div className="dash-field" style={{ marginBottom: state?.error ? 8 : 20 }}>
        <label className="dash-label" htmlFor="register-password">
          Пароль
        </label>
        <input id="register-password" name="password" type="password" className="dash-input" required minLength={8} />
        <div className="dash-hint">Не короче 8 символов.</div>
      </div>

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
