"use client";

import { Icon } from "@/components/dashboard/icons/Icon";

export type DialogFilterValue = "all" | "leads" | "no-lead";

export function DialogFilters({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  filter: DialogFilterValue;
  onFilterChange: (value: DialogFilterValue) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
      <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
        <span style={{ position: "absolute", left: 10, top: 9, color: "var(--dash-text-tertiary)" }}>
          <Icon name="search" size={14} />
        </span>
        <input
          className="dash-input"
          style={{ paddingLeft: 32 }}
          placeholder="Поиск по сообщениям или имени..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <input
        type="date"
        className="dash-input"
        style={{ width: 150 }}
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        aria-label="Дата с"
      />
      <input
        type="date"
        className="dash-input"
        style={{ width: 150 }}
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        aria-label="Дата по"
      />
      <select
        className="dash-select"
        style={{ width: 180 }}
        value={filter}
        onChange={(e) => onFilterChange(e.target.value as DialogFilterValue)}
      >
        <option value="all">Все диалоги</option>
        <option value="leads">С заявкой</option>
        <option value="no-lead">Без заявки</option>
      </select>
    </div>
  );
}
