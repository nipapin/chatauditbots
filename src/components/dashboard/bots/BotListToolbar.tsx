"use client";

import Link from "next/link";
import { Icon } from "@/components/dashboard/icons/Icon";

export function BotListToolbar({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
        <span style={{ position: "absolute", left: 10, top: 9, color: "var(--dash-text-tertiary)" }}>
          <Icon name="search" size={14} />
        </span>
        <input
          className="dash-input"
          style={{ paddingLeft: 32 }}
          placeholder="Поиск по названию бота..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <Link href="/new" className="dash-btn dash-btn-primary">
        <Icon name="plus" size={14} color="#fff" />
        Создать бота
      </Link>
    </div>
  );
}
