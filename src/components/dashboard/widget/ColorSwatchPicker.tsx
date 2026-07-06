"use client";

import { useEffect, useRef } from "react";

export function ColorSwatchPicker({
  label,
  value,
  onChange,
  onCommit,
}: {
  label: string;
  value: string;
  /** Обновляет локальное состояние формы — вызывается на каждое изменение, для мгновенного предпросмотра. */
  onChange: (value: string) => void;
  /** Сохраняет значение на сервер — только когда цвет выбран окончательно (закрыт пикер / потеряна фокусировка поля). */
  onCommit: (value: string) => void;
}) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = colorInputRef.current;
    if (!el) return;
    // Нативное событие "change" у input[type=color] срабатывает один раз, когда пикер
    // закрыт — в отличие от React onChange (= "input"), который стреляет на каждое
    // промежуточное значение при перетаскивании внутри пикера.
    const handleCommit = () => onCommit(el.value);
    el.addEventListener("change", handleCommit);
    return () => el.removeEventListener("change", handleCommit);
  }, [onCommit]);

  return (
    <div className="dash-field">
      <label className="dash-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          ref={colorInputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 34,
            height: 34,
            padding: 0,
            border: "0.5px solid var(--dash-input-border)",
            borderRadius: "var(--dash-radius-sm)",
            background: "none",
            cursor: "pointer",
          }}
        />
        <input
          className="dash-input"
          style={{ maxWidth: 120 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onCommit(e.target.value)}
        />
      </div>
    </div>
  );
}
