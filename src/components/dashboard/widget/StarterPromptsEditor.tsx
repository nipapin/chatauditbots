"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";
import { IconButton } from "@/components/dashboard/shared/IconButton";
import { useDebouncedCallback } from "@/lib/dashboard/useDebouncedCallback";

export function StarterPromptsEditor({
  prompts,
  onChange,
  onCommit,
}: {
  prompts: string[];
  /** Обновляет локальное состояние формы — мгновенно, для предпросмотра. */
  onChange: (prompts: string[]) => void;
  /** Сохраняет список на сервер. */
  onCommit: (prompts: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const debouncedCommit = useDebouncedCallback(onCommit, 600);

  const addPrompt = () => {
    if (!draft.trim()) return;
    const next = [...prompts, draft.trim()];
    onChange(next);
    onCommit(next);
    setDraft("");
  };

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
                debouncedCommit(next);
              }}
            />
            <IconButton
              icon="x"
              label="Удалить подсказку"
              onClick={() => {
                const next = prompts.filter((_, idx) => idx !== i);
                onChange(next);
                onCommit(next);
              }}
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
            addPrompt();
          }}
        />
        <button type="button" className="dash-btn" onClick={addPrompt}>
          <Icon name="plus" size={13} />
          Добавить
        </button>
      </div>
      <div className="dash-hint">Показываются посетителю до начала диалога, помогают быстро задать вопрос.</div>
    </div>
  );
}
