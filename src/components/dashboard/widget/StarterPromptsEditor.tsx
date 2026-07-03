"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";
import { IconButton } from "@/components/dashboard/shared/IconButton";

export function StarterPromptsEditor({
  prompts,
  onChange,
}: {
  prompts: string[];
  onChange: (prompts: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="dash-field" style={{ marginBottom: 0 }}>
      <label className="dash-label">Стартовые подсказки</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
        {prompts.map((prompt, i) => (
          <div key={i} style={{ display: "flex", gap: 6 }}>
            <input
              className="dash-input"
              value={prompt}
              onChange={(e) => {
                const next = [...prompts];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <IconButton
              icon="x"
              label="Удалить подсказку"
              onClick={() => onChange(prompts.filter((_, idx) => idx !== i))}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          className="dash-input"
          placeholder="Новая подсказка..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (!draft.trim()) return;
            onChange([...prompts, draft.trim()]);
            setDraft("");
          }}
        />
        <button
          type="button"
          className="dash-btn"
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...prompts, draft.trim()]);
            setDraft("");
          }}
        >
          <Icon name="plus" size={13} />
          Добавить
        </button>
      </div>
      <div className="dash-hint">Показываются посетителю до начала диалога, помогают быстро задать вопрос.</div>
    </div>
  );
}
