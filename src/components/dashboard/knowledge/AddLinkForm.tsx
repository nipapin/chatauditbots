"use client";

import { useState } from "react";
import { Icon } from "@/components/dashboard/icons/Icon";

export function AddLinkForm({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setUrl("");
      }}
      style={{ display: "flex", gap: 8 }}
    >
      <div style={{ position: "relative", flex: 1 }}>
        <span style={{ position: "absolute", left: 10, top: 9, color: "var(--dash-text-tertiary)" }}>
          <Icon name="link" size={14} />
        </span>
        <input
          className="dash-input"
          style={{ paddingLeft: 32 }}
          placeholder="https://example.com/страница"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <button type="submit" className="dash-btn" disabled={!url.trim()}>
        Добавить ссылку
      </button>
    </form>
  );
}
