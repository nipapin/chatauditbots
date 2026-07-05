"use client";

import { useState } from "react";

export function AddTextForm({ onAdd }: { onAdd: (title: string, text: string) => void }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmedTitle = title.trim();
        const trimmedText = text.trim();
        if (!trimmedTitle || !trimmedText) return;
        onAdd(trimmedTitle, trimmedText);
        setTitle("");
        setText("");
      }}
    >
      <div className="dash-field">
        <input
          className="dash-input"
          placeholder="Заголовок материала"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="dash-field" style={{ marginBottom: 8 }}>
        <textarea
          className="dash-textarea"
          rows={4}
          placeholder="Вставьте текст, который должен знать бот..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button type="submit" className="dash-btn" disabled={!title.trim() || !text.trim()}>
        Добавить текст
      </button>
    </form>
  );
}
