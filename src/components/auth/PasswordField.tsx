"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  required,
  minLength,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="dash-field">
      <label className="dash-label" htmlFor={id}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          className="dash-input"
          style={{ paddingRight: 36 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            color: "var(--dash-text-tertiary)",
          }}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={16} />
        </button>
      </div>
      {hint && <div className="dash-hint">{hint}</div>}
    </div>
  );
}
