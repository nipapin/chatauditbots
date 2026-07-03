"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/app/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="dash-card" style={{ width: 360 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Вход в ChatAudit</h1>
      <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", marginBottom: 20 }}>
        Войдите, чтобы управлять своими чат-ботами.
      </p>

      <div className="dash-field">
        <label className="dash-label" htmlFor="login-email">
          Email
        </label>
        <input id="login-email" name="email" type="email" className="dash-input" required autoFocus />
      </div>

      <div className="dash-field" style={{ marginBottom: state?.error ? 8 : 20 }}>
        <label className="dash-label" htmlFor="login-password">
          Пароль
        </label>
        <input id="login-password" name="password" type="password" className="dash-input" required />
      </div>

      {state?.error && (
        <div style={{ fontSize: 12, color: "var(--dash-danger-fg)", marginBottom: 12 }}>{state.error}</div>
      )}

      <button type="submit" className="dash-btn dash-btn-primary" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Входим..." : "Войти"}
      </button>

      <div style={{ fontSize: 12, color: "var(--dash-text-tertiary)", marginTop: 16, textAlign: "center" }}>
        Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
      </div>
    </form>
  );
}
