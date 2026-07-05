"use client";

import { useState } from "react";
import { useBot } from "@/lib/dashboard/useBot";
import { useToast } from "@/components/dashboard/shared/Toast";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Icon } from "@/components/dashboard/icons/Icon";
import { DialogFilters, type DialogFilterValue } from "./DialogFilters";
import { DialogListTable } from "./DialogListTable";

/** "YYYY-MM-DD" из <input type=date> — начало/конец суток в ЛОКАЛЬНОМ времени браузера,
 * а не UTC-полночь (new Date("YYYY-MM-DD") парсится как UTC и уводит границу на часы). */
function startOfLocalDay(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}
function endOfLocalDay(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

export function DialogsBrowser({ botId }: { botId: string }) {
  const { bot, dialogs, data } = useBot(botId);
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DialogFilterValue>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const hasMockDialogs = dialogs.some((d) => d.isMock);

  if (!bot) {
    return <EmptyState title="Бот не найден" description="Возможно, он был удалён." />;
  }

  const filtered = dialogs.filter((dialog) => {
    if (filter === "leads" && !dialog.leadCaptured) return false;
    if (filter === "no-lead" && dialog.leadCaptured) return false;
    const startedAt = new Date(dialog.startedAt).getTime();
    if (dateFrom && startedAt < startOfLocalDay(dateFrom)) return false;
    if (dateTo && startedAt > endOfLocalDay(dateTo)) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const visitorMatch =
      dialog.visitor?.name?.toLowerCase().includes(q) ||
      dialog.visitor?.email?.toLowerCase().includes(q) ||
      dialog.visitor?.phone?.toLowerCase().includes(q);
    const messageMatch = dialog.messages.some((m) => m.text.toLowerCase().includes(q));
    return Boolean(visitorMatch || messageMatch);
  });

  return (
    <>
      {process.env.NODE_ENV !== "production" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            padding: "8px 12px",
            borderRadius: "var(--dash-radius-md)",
            background: "var(--dash-warning-bg)",
            color: "var(--dash-warning-fg)",
            fontSize: 12,
          }}
        >
          <span>Dev-режим: нет диалогов для теста? Сгенерируйте мокап-данные.</span>
          <button
            type="button"
            className="dash-btn"
            style={{ height: 28, fontSize: 12, flexShrink: 0 }}
            disabled={seeding}
            onClick={async () => {
              setSeeding(true);
              try {
                const count = await data.seedMockDialogs(botId);
                show(`Добавлено мокап-диалогов: ${count}`, "success");
              } catch (err) {
                show(err instanceof Error ? err.message : "Не удалось создать мокап-диалоги", "danger");
              } finally {
                setSeeding(false);
              }
            }}
          >
            <Icon name={seeding ? "clock" : "message-circle"} size={13} />
            {seeding ? "Создаём..." : "Добавить тестовые диалоги"}
          </button>
          {hasMockDialogs && (
            <button
              type="button"
              className="dash-btn dash-btn-danger"
              style={{ height: 28, fontSize: 12, flexShrink: 0 }}
              disabled={clearing}
              onClick={async () => {
                setClearing(true);
                try {
                  const count = await data.clearMockDialogs(botId);
                  show(`Удалено мокап-диалогов: ${count}`, "success");
                } catch (err) {
                  show(err instanceof Error ? err.message : "Не удалось удалить мокап-диалоги", "danger");
                } finally {
                  setClearing(false);
                }
              }}
            >
              <Icon name="trash" size={13} />
              {clearing ? "Удаляем..." : "Удалить мокап-диалоги"}
            </button>
          )}
        </div>
      )}

      <DialogFilters
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
      />
      <DialogListTable botId={botId} dialogs={filtered} />
    </>
  );
}
